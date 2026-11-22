// AVISOS — lógica pura (sem DOM): datas, formatadores, parser, estado.
export const CULTOS = ['9h', '11h', '17h', '19h'];
export const MIN_DOMINGO = ['NINHO', 'ARCA', 'REINO', 'SAFÁRI', 'CONNECT', 'FAROL', 'CHECK-IN', 'LÍDER DE CULTO'];
export const MIN_QDE = ['NINHO', 'ARCA', 'REINO', 'SAFÁRI', 'CONNECT', 'CHECK-IN', 'LÍDER DE CULTO'];
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const pad = (n) => String(n).padStart(2, '0');
const blank4 = () => ['', '', '', ''];

// ---------- datas ----------
export function nextSunday(from) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  return d;
}
export function fmtDate(d) { return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${pad(d.getFullYear() % 100)}`; }
export function weekKey(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  const wk = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return `${y}-W${pad(wk)}`;
}
export function mondayOf(d) {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

// ---------- estado ----------
export function defaultState() {
  const counts = {};
  MIN_DOMINGO.forEach((m) => (counts[m] = [0, 0, 0, 0]));
  const qde = {};
  MIN_QDE.forEach((m) => (qde[m] = { lider: '', voluntarios: [] }));
  qde.COMUNICADORES = { arcaReino: '', entrega: '' };
  return {
    sunday: { counts, producao: blank4(), comunicadores: { ninhoArca: blank4(), entrega: blank4() }, liderJunior: blank4() },
    qde,
    contatos: [],
    events: [
      { dia: 2, hora: '', titulo: 'Gerar escala QDE' },
      { dia: 4, hora: '', titulo: 'Gerar escala de domingo e cobrar supervisores' },
      { dia: 5, hora: '', titulo: 'Fechar vagas em aberto' },
      { dia: 6, hora: '', titulo: 'Enviar escala final nos grupos' },
      { dia: 0, hora: '9h', titulo: 'Culto 9h' },
      { dia: 0, hora: '11h', titulo: 'Culto 11h' },
      { dia: 0, hora: '17h', titulo: 'Culto 17h' },
      { dia: 0, hora: '19h', titulo: 'Culto 19h' },
    ],
    wordOffset: 0,
    words: null,
  };
}
export function loadState(storage) {
  try {
    const raw = storage.getItem('avisos:v1');
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch { return defaultState(); }
}
export function saveState(storage, s) { try { storage.setItem('avisos:v1', JSON.stringify(s)); } catch { /* ignora */ } }
export function exportBackup(s) { return JSON.stringify(s, null, 2); }
export function importBackup(json) {
  try { const o = JSON.parse(json); if (!o || typeof o !== 'object' || !o.sunday || !o.qde) throw 0; return o; }
  catch { throw new Error('Backup inválido'); }
}
export function waLink(phone, text) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits && !digits.startsWith('55')) digits = '55' + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

// ---------- formatadores ----------
const vol = (n) => `${pad(n)} voluntári${n === 1 ? 'a' : 'as'}${n === 0 ? ' ❌' : ''}`;
export function totalCulto(data, idx) {
  return MIN_DOMINGO.reduce((s, m) => s + (data.counts[m]?.[idx] || 0), 0);
}
export function formatSunday(data, date) {
  const out = [`*ESCALA DE DOMINGO: ${fmtDate(date)} > VIDEIRA KIDS VOLUTS*`, ''];
  for (const m of MIN_DOMINGO) {
    out.push(`*${m}*`);
    CULTOS.forEach((c, i) => out.push(`${pad(parseInt(c))}h - ${vol(data.counts[m]?.[i] || 0)}`));
    out.push('');
  }
  out.push('*PRODUÇÃO*');
  CULTOS.forEach((c, i) => out.push(`✨ *${c}* - ${data.producao[i] || ''}`.trimEnd()));
  out.push('', '*COMUNICADORES*');
  CULTOS.forEach((c, i) => {
    out.push(`✨ *${c}*`);
    out.push(`NINHO/ARCA - ${data.comunicadores.ninhoArca[i] || ''}`.trimEnd());
    out.push(`SALA ENTREGA - ${data.comunicadores.entrega[i] || ''}`.trimEnd());
  });
  out.push('', '*LÍDER JÚNIOR*');
  CULTOS.forEach((c, i) => out.push(`✨ *${c}* - ${data.liderJunior[i] || ''}`.trimEnd()));
  return out.join('\n');
}
export function formatQDE(q) {
  const out = ['*ESCALA QDE*', ''];
  for (const m of MIN_QDE) {
    const x = q[m] || { lider: '', voluntarios: [] };
    out.push(`*${m}*`, `Líder - ${x.lider}`.trimEnd());
    (x.voluntarios.length ? x.voluntarios : ['']).forEach((v) => out.push(`- ${v}`.trimEnd()));
    out.push('');
  }
  const c = q.COMUNICADORES || {};
  out.push('*COMUNICADORES*', `ARCA/REINO: ${c.arcaReino || ''}`.trimEnd(), `SALA ENTREGA: *${c.entrega || ''}*`);
  return out.join('\n');
}
export function fillTemplate(texto, vars) {
  return texto.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== '' ? vars[k] : m));
}
export function wordOfWeek(words, d, offset = 0) {
  const [y, w] = weekKey(d).split('-W').map(Number);
  return words[(((y * 53 + w + offset) % words.length) + words.length) % words.length];
}
export function formatPalavra(w) {
  return `📖 *Palavra da semana*\n\n_"${w.verse}"_\n*${w.ref}*\n\n💡 ${w.wisdom}\n\nBoa semana, voluntários! 💚`;
}
export function formatPlanner(events, monday) {
  const out = [`📅 *Planner da semana — ${fmtDate(monday)}*`, ''];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(d.getDate() + i);
    const dia = d.getDay();
    const evs = events.filter((e) => e.dia === dia).sort((a, b) => parseInt(a.hora || 0) - parseInt(b.hora || 0));
    out.push(`*${DIAS[dia]} (${pad(d.getDate())}/${pad(d.getMonth() + 1)})*`);
    if (!evs.length) out.push('— sem atividades');
    evs.forEach((e) => out.push(`• ${e.hora ? e.hora + ' — ' : ''}${e.titulo}`));
    out.push('');
  }
  out.push('Qualquer dúvida, falem com a liderança. Vamos juntos! 💚');
  return out.join('\n');
}

// ---------- parser ----------
const clean = (s) => s.replace(/[‍️]/g, '').replace(/[✨❌*]/g, '').trim();
const stripTrainee = (s) => s.replace(/\s*-?\s*(trainee|treinee).*$/i, '').trim();
export function parseSchedule(text) {
  if (!text || !text.trim()) throw new Error('Texto vazio');
  const lines = text.split(/\r?\n/).map((l) => l.replace(/^\[[^\]]*\][^:]*:\s*/, ''));
  const head = lines.map(clean).join('\n').toUpperCase();
  if (head.includes('ESCALA DE DOMINGO')) return parseDomingo(lines);
  if (head.includes('ESCALA QDE')) return parseQDE(lines);
  throw new Error('Formato não reconhecido');
}
function parseDomingo(lines) {
  const s = defaultState().sunday;
  let cur = null, cult = -1;
  let date;
  const idxOf = (t) => CULTOS.findIndex((c) => parseInt(c) === parseInt(t));
  for (const raw of lines) {
    const l = clean(raw);
    if (!l) continue;
    const dm = l.match(/ESCALA DE DOMINGO:\s*(\d{2}\.\d{2}\.\d{2})/i);
    if (dm) { date = dm[1]; continue; }
    const sec = l.match(/^([A-ZÀ-Ú][A-ZÀ-Ú\- ]+)$/);
    if (sec && !/^\d/.test(l)) { cur = sec[1].trim(); cult = -1; continue; }
    if (cur === 'PRODUÇÃO' || cur === 'LÍDER JÚNIOR') {
      const m = l.match(/^(\d{1,2})h(?:00)?\s*-\s*(.*)$/);
      if (m && idxOf(m[1]) >= 0) {
        const v = stripTrainee(m[2]);
        (cur === 'PRODUÇÃO' ? s.producao : s.liderJunior)[idxOf(m[1])] = v;
      }
    } else if (cur === 'COMUNICADORES') {
      const h = l.match(/^(\d{1,2})h(?:00)?$/);
      if (h) { cult = idxOf(h[1]); continue; }
      const m = l.match(/^(NINHO\/ARCA|SALA ENTREGA)\s*-\s*(.*)$/i);
      if (m && cult >= 0) (/NINHO/i.test(m[1]) ? s.comunicadores.ninhoArca : s.comunicadores.entrega)[cult] = m[2].trim();
    } else if (cur && s.counts[cur]) {
      const m = l.match(/^(\d{1,2})h\s*-\s*(\d+)/);
      if (m && idxOf(m[1]) >= 0) s.counts[cur][idxOf(m[1])] = parseInt(m[2], 10);
    }
  }
  return { kind: 'domingo', data: s, date };
}
function parseQDE(lines) {
  const q = defaultState().qde;
  let cur = null;
  for (const raw of lines) {
    const l = clean(raw);
    if (!l || /ESCALA QDE/i.test(l)) continue;
    const sec = l.match(/^([A-ZÀ-Ú][A-ZÀ-Ú\- ]+)$/);
    if (sec) { cur = sec[1].trim(); continue; }
    if (cur === 'COMUNICADORES') {
      const m = l.match(/^(ARCA\/REINO|SALA ENTREGA):\s*(.*)$/i);
      if (m) q.COMUNICADORES[/ARCA/i.test(m[1]) ? 'arcaReino' : 'entrega'] = m[2].trim();
    } else if (cur && q[cur]) {
      const lid = l.match(/^L[ií]der\s*-\s*(.*)$/i);
      if (lid) q[cur].lider = stripTrainee(lid[1]);
      else if (l.startsWith('-')) { const v = stripTrainee(l.slice(1)); if (v) q[cur].voluntarios.push(v); }
    }
  }
  return { kind: 'qde', data: q };
}
