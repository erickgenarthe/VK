// Biblioteca compartilhada pelas funções agendadas do CCVServe (lembretes,
// agradecimento e resumos por WhatsApp). De propósito sem NENHUMA dependência
// do npm (nada de firebase-admin, nada de node-fetch) — assim dá pra publicar
// essas funções só arrastando a pasta pro Netlify OU via GitHub, sem precisar
// rodar "npm install" em lugar nenhum. Usa só o que já vem pronto no Node 18+
// do Netlify: fetch e node:crypto.

import { createSign } from 'node:crypto';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

let tokenCache = null; // { token, exp }
export async function getGoogleAccessToken() {
  if (tokenCache && tokenCache.exp > Date.now() / 1000 + 30) return tokenCache.token;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) throw new Error('Faltam as variáveis FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY no Netlify.');
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const unsigned = base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(claims));
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const jwt = unsigned + '.' + signature;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Falha ao autenticar no Firebase: ' + JSON.stringify(data));
  tokenCache = { token: data.access_token, exp: now + (data.expires_in || 3600) };
  return data.access_token;
}

function decodeValue(v) {
  if (v == null) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {});
  return null;
}
function decodeFields(fields) {
  const out = {};
  for (const k in fields) out[k] = decodeValue(fields[k]);
  return out;
}
function decodeDoc(doc) {
  const out = decodeFields(doc.fields || {});
  out._id = doc.name.split('/').pop();
  return out;
}
function encodeValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (typeof v === 'object') return { mapValue: { fields: encodeFields(v) } };
  return { stringValue: String(v) };
}
function encodeFields(obj) {
  const out = {};
  for (const k in obj) out[k] = encodeValue(obj[k]);
  return out;
}

export async function fsListCollection(path) {
  const token = await getGoogleAccessToken();
  const docs = [];
  let pageToken = '';
  do {
    const url = `${FIRESTORE_BASE}/${path}?pageSize=300${pageToken ? '&pageToken=' + pageToken : ''}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) throw new Error('Erro ao ler ' + path + ': ' + JSON.stringify(data));
    (data.documents || []).forEach((d) => docs.push(decodeDoc(d)));
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return docs;
}

export async function fsGetDoc(path) {
  const token = await getGoogleAccessToken();
  const res = await fetch(`${FIRESTORE_BASE}/${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 404) return null;
  const data = await res.json();
  if (!res.ok) throw new Error('Erro ao ler ' + path + ': ' + JSON.stringify(data));
  return decodeDoc(data);
}

export async function fsSetDoc(path, obj) {
  const token = await getGoogleAccessToken();
  const res = await fetch(`${FIRESTORE_BASE}/${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: encodeFields(obj) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Erro ao salvar ' + path + ': ' + JSON.stringify(data));
  return data;
}

// Gera um ID de documento novo pro lado do servidor — mesmo formato do
// genId() usado no navegador (index.html), pra criar documentos com ID
// automático via fsSetDoc (que exige um path/ID explícito).
export function fsNovoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// "dados" guarda cada chave como um doc {value: <qualquer coisa>} — mesmo
// formato que o app usa no navegador em loadData()/saveData().
export async function lerDados(chave, padrao) {
  const doc = await fsGetDoc('dados/' + chave);
  return doc && doc.value !== undefined ? doc.value : padrao;
}
export async function salvarDados(chave, valor) {
  return fsSetDoc('dados/' + chave, { value: valor });
}

// ============ WHATSAPP CLOUD API (Meta) ============
export async function enviarWhatsAppTemplate(paraTelefone, templateName, bodyParams) {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;
  const lang = process.env.WHATSAPP_LANG || 'pt_BR';
  if (!phoneId || !token) throw new Error('Faltam WHATSAPP_PHONE_ID / WHATSAPP_TOKEN no Netlify.');
  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: paraTelefone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: lang },
        components: [{ type: 'body', parameters: bodyParams.map((p) => ({ type: 'text', text: String(p || '-') })) }],
      },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) console.error('Erro ao enviar WhatsApp pra', paraTelefone, JSON.stringify(data));
  return res.ok;
}

export function normalizarTelefoneBR(tel) {
  const digits = String(tel || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  return '55' + digits;
}

// ============ DATA/HORA NO FUSO DO BRASIL (UTC-3 fixo, sem horário de verão) ============
export function agoraBrasil() {
  return new Date(Date.now() - 3 * 60 * 60 * 1000);
}
export function isoDataBrasil(d) {
  return (d || agoraBrasil()).toISOString().slice(0, 10);
}
export function horaMinutoBrasil(d) {
  const dt = d || agoraBrasil();
  return String(dt.getUTCHours()).padStart(2, '0') + ':' + String(dt.getUTCMinutes()).padStart(2, '0');
}

const DIAS_SEMANA = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
export function diaSemanaBrasil(d) {
  return DIAS_SEMANA[(d || agoraBrasil()).getUTCDay()];
}
export function mesIdBrasil(offsetMeses) {
  const d = agoraBrasil();
  const mesTotal = d.getUTCFullYear() * 12 + d.getUTCMonth() + (offsetMeses || 0);
  const ano = Math.floor(mesTotal / 12), mes = mesTotal % 12;
  return ano + '-' + String(mes + 1).padStart(2, '0');
}
export function nomeMesPt(id) {
  const [ano, mes] = id.split('-').map(Number);
  const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return nomes[mes - 1] + ' de ' + ano;
}
export function formatarDataBonitaPt(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return String(dia).padStart(2, '0') + '/' + String(mes).padStart(2, '0') + '/' + ano + ' (' + dias[d.getUTCDay()] + ')';
}

// Reproduz a mesma lógica de gerarDatasDoMes() do app: cruza os eventos
// recorrentes (config.eventos) com os avulsos (eventosEsporadicos) pra saber
// todo dia do mês que tem compromisso de escala.
export function gerarDatasDoMes(idMes, configEventos, eventosEsporadicos) {
  const [ano, mesNum] = idMes.split('-').map(Number);
  const diasNoMes = new Date(Date.UTC(ano, mesNum, 0)).getUTCDate();
  const linhas = [];
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const d = new Date(Date.UTC(ano, mesNum - 1, dia));
    const iso = ano + '-' + String(mesNum).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
    const diaSemana = DIAS_SEMANA[d.getUTCDay()];
    (configEventos || []).forEach((ev) => {
      const bate = ev.dataEspecifica ? ev.dataEspecifica === iso : ev.dia === diaSemana;
      if (bate) linhas.push({ data: iso, tipo: 'recorrente', eventoId: ev.id, eventoNome: ev.nome, horario: ev.horario, horarioFim: ev.horarioFim });
    });
  }
  (eventosEsporadicos || []).forEach((ev) => {
    if (ev.data && ev.data.slice(0, 7) === idMes && !ev.excluido) {
      linhas.push({ data: ev.data, tipo: 'esporadico', eventoId: ev._id, eventoNome: ev.nome, horario: ev.horario, horarioFim: ev.horarioFim });
    }
  });
  return linhas.sort((a, b) => (a.data + (a.horario || '')).localeCompare(b.data + (b.horario || '')));
}

export function minutosDoHorario(hhmm) {
  const [h, m] = (hhmm || '00:00').split(':').map(Number);
  return h * 60 + m;
}
export function somarMinutos(hhmm, minutosSomar) {
  const total = minutosDoHorario(hhmm) + minutosSomar;
  const h = Math.floor(total / 60) % 24, m = total % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

// ============ VERSÍCULOS DE RESERVA (viver, amar e servir) — domínio
// público, tradução Almeida antiga. Usados só quando nenhum líder define o
// versículo do dia no app. Escolhido pelo dia do ano, pra dar variedade sem
// repetir toda hora. ============
export const VERSICULOS_RESERVA = [
  { texto: 'Servi uns aos outros pelo amor.', referencia: 'Gálatas 5:13' },
  { texto: 'Um mandamento novo vos dou: que vos ameis uns aos outros; assim como eu vos amei, que também vós ameis uns aos outros.', referencia: 'João 13:34' },
  { texto: 'Cada um exercite o dom que recebeu, servindo uns aos outros, como bons despenseiros da multiforme graça de Deus.', referencia: '1 Pedro 4:10' },
  { texto: 'E tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor, e não aos homens.', referencia: 'Colossenses 3:23' },
  { texto: 'Porque o Filho do homem também não veio para ser servido, mas para servir.', referencia: 'Marcos 10:45' },
  { texto: 'Não nos cansemos de fazer o bem, pois no tempo próprio colheremos, se não desanimarmos.', referencia: 'Gálatas 6:9' },
  { texto: 'Filhinhos, não amemos de palavra, nem de língua, mas por obra e em verdade.', referencia: '1 João 3:18' },
  { texto: 'Sobre tudo, porém, revesti-vos de amor, que é o vínculo da perfeição.', referencia: 'Colossenses 3:14' },
  { texto: 'Amados, amemo-nos uns aos outros, porque o amor procede de Deus.', referencia: '1 João 4:7' },
  { texto: 'Eu vim para que tenham vida, e a tenham com abundância.', referencia: 'João 10:10' },
  { texto: 'Pelo amor sede servos uns dos outros.', referencia: 'Gálatas 5:13' },
  { texto: 'Portanto, quer comais, quer bebais, ou façais outra qualquer coisa, fazei tudo para glória de Deus.', referencia: '1 Coríntios 10:31' },
];
export function versiculoDoDia(idsoData) {
  const d = new Date(idsoData + 'T00:00:00Z');
  const inicioAno = Date.UTC(d.getUTCFullYear(), 0, 1);
  const diaDoAno = Math.floor((d.getTime() - inicioAno) / 86400000);
  return VERSICULOS_RESERVA[diaDoAno % VERSICULOS_RESERVA.length];
}
