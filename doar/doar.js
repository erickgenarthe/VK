/* Camada de dados do "Outubro da Criança".
   Sem Firebase configurado roda em MODO DEMONSTRAÇÃO (localStorage + BroadcastChannel):
   dá para testar o fluxo inteiro, inclusive o telão numa aba e o celular em outra. */

const DOAR_CONFIG = {
  firebaseConfig: {
    apiKey: 'COLE_AQUI_SUA_API_KEY',
    authDomain: 'COLE_AQUI.firebaseapp.com',
    projectId: 'COLE_AQUI',
    storageBucket: 'COLE_AQUI.firebasestorage.app',
    messagingSenderId: '',
    appId: ''
  },
  // Endereço que o QR Code do telão abre. Vazio = usa o endereço da própria página inicial do site.
  urlPublica: '',
  // Mensagem enviada pelo painel ao chamar a pessoa no WhatsApp. {nome} e {itens} são trocados.
  mensagemWhats:
    'Oi, {nome}! Aqui é da Videira Kids 💛 Vimos que você quer doar para o Outubro da Criança: {itens}. ' +
    'Obrigado pelo carinho! Podemos combinar a melhor forma de você entregar ou enviar?'
};

/* Itens da lista "O que doar" (Tatames e abafadores/cubos infinitos foram riscados na lista, então ficam de fora). */
const ITENS = [
  { id:'pufes',      nome:'Pufes',                         detalhe:'',                                                              cor:'azul' },
  { id:'faz-de-conta',nome:'Brinquedos de cozinha, salão, engenheiro e médico', detalhe:'Faz de conta',                           cor:'vermelho' },
  { id:'carros',     nome:'Carros de brinquedo',           detalhe:'Grandes',                                                       cor:'amarelo' },
  { id:'dinos',      nome:'Dinossauros',                   detalhe:'Grandes',                                                       cor:'verde' },
  { id:'bonecos',    nome:'Bonecas Barbies e Bonecos de Super Heróis', detalhe:'',                                                  cor:'rosa' },
  { id:'esportivos', nome:'Brinquedos esportivos',         detalhe:'Corda de pular, basquete, tiro ao alvo, boliche, pega bolinha', cor:'laranja' },
  { id:'papelaria',  nome:'Itens de papelaria',            detalhe:'Lápis jumbo, canetões, cola bastão, tesoura, cartolina, EVA, TNT', cor:'roxo' },
  { id:'regulacao',  nome:'Itens de regulação',            detalhe:'Pop its e massinhas',                                           cor:'azul' }
];
const ICONES = {
  'pufes': `<ellipse cx="32" cy="55" rx="21" ry="4" fill="rgba(29,26,43,.15)"/><path d="M10 42c-1-14 8-24 22-24s23 10 22 24c-1 9-9 12-22 12S11 51 10 42z" fill="#0A9BE3" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M22 25c6 3 14 3 20 0" fill="none" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M17 38c1-5 4-8 8-10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`,
  'faz-de-conta': `<path d="M11 29h42v17c0 6-5 10-11 10H22c-6 0-11-4-11-10z" fill="#E8272F" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M12 29c1-9 9-13 20-13s19 4 20 13z" fill="#FF7B80" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="32" cy="13" r="3.5" fill="#1D1A2B"/><path d="M11 36H5M53 36h6" fill="none" stroke="#1D1A2B" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M20 38v10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>`,
  'carros': `<rect x="5" y="24" width="33" height="24" rx="3" fill="#F6B800" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M38 31h11l9 9v8H38z" fill="#E8272F" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M43 34h5l5 6h-10z" fill="#BFE8FF"/><rect x="10" y="30" width="22" height="3" rx="1.5" fill="#fff" opacity=".6"/><circle cx="19" cy="50" r="7" fill="#1D1A2B"/><circle cx="19" cy="50" r="2.6" fill="#ddd"/><circle cx="46" cy="50" r="7" fill="#1D1A2B"/><circle cx="46" cy="50" r="2.6" fill="#ddd"/>`,
  'dinos': `<path d="M13 36L3 47" fill="none" stroke="#1D1A2B" stroke-width="12" stroke-linecap="round"/><path d="M13 36L3 47" fill="none" stroke="#3DAA3C" stroke-width="7" stroke-linecap="round"/><path d="M42 31l8-16" fill="none" stroke="#1D1A2B" stroke-width="13" stroke-linecap="round"/><path d="M42 31l8-16" fill="none" stroke="#3DAA3C" stroke-width="8" stroke-linecap="round"/><rect x="17" y="40" width="9" height="17" rx="3.5" fill="#2E8B2D" stroke="#1D1A2B" stroke-width="2.5" stroke-linejoin="round"/><rect x="36" y="40" width="9" height="17" rx="3.5" fill="#2E8B2D" stroke="#1D1A2B" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="29" cy="37" rx="20" ry="11" fill="#3DAA3C" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round"/><path d="M16 28l4-8 5 7M26 26l5-9 5 8M36 28l5-7 3 8" fill="#F28A12" stroke="#1D1A2B" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="53" cy="12" rx="9" ry="6.5" fill="#3DAA3C" stroke="#1D1A2B" stroke-width="3"/><circle cx="54" cy="10" r="1.8" fill="#1D1A2B"/><path d="M26 44c3 2 8 2 11 0" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>`,
  'bonecos': `<path d="M22 27L10 56h44L42 27z" fill="#E8272F" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><rect x="23" y="27" width="18" height="18" rx="5" fill="#DE3A98" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><rect x="24" y="44" width="7" height="12" rx="2.5" fill="#0A9BE3" stroke="#1D1A2B" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><rect x="33" y="44" width="7" height="12" rx="2.5" fill="#0A9BE3" stroke="#1D1A2B" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="32" cy="17" r="9" fill="#F3C7A1" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M23 17c0-8 5-11 10-10 5 0 8 4 8 10-3-4-8-6-12-5-3 1-5 3-6 5z" fill="#6B3A1E" stroke="#1D1A2B" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><path d="M32 30l2 4 4 .5-3 3 .8 4.2-3.8-2-3.8 2 .8-4.2-3-3 4-.5z" fill="#F6B800"/>`,
  'esportivos': `<circle cx="32" cy="32" r="25" fill="#F28A12" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M7 32h50M32 7v50" fill="none" stroke="#1D1A2B" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><path d="M14 13c11 8 11 30 0 38M50 13c-11 8-11 30 0 38" fill="none" stroke="#1D1A2B" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><path d="M16 20c3-4 7-7 11-8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>`,
  'papelaria': `<g transform="rotate(40 32 32)"><rect x="25" y="14" width="14" height="32" fill="#F6B800" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M32 18v24" stroke="#F28A12" stroke-width="3" stroke-linecap="round"/><path d="M25 46h14L32 60z" fill="#F3C7A1" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M29.5 55l2.5 5 2.5-5z" fill="#1D1A2B"/><rect x="25" y="9" width="14" height="5" fill="#C9CCD6" stroke="#1D1A2B" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><path d="M25 9V6c0-3 3-4 7-4s7 1 7 4v3z" fill="#DE3A98" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></g>`,
  'regulacao': `<rect x="7" y="7" width="50" height="50" rx="11" fill="#8E44B8" stroke="#1D1A2B" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="20" cy="20" r="5.2" fill="#E8272F" stroke="#1D1A2B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="18.4" cy="18.2" r="1.5" fill="#fff" opacity=".7"/><circle cx="32" cy="20" r="5.2" fill="#F6B800" stroke="#1D1A2B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="30.4" cy="18.2" r="1.5" fill="#fff" opacity=".7"/><circle cx="44" cy="20" r="5.2" fill="#0A9BE3" stroke="#1D1A2B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="42.4" cy="18.2" r="1.5" fill="#fff" opacity=".7"/><circle cx="20" cy="32" r="5.2" fill="#F6B800" stroke="#1D1A2B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="18.4" cy="30.2" r="1.5" fill="#fff" opacity=".7"/><circle cx="32" cy="32" r="5.2" fill="#0A9BE3" stroke="#1D1A2B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="30.4" cy="30.2" r="1.5" fill="#fff" opacity=".7"/><circle cx="44" cy="32" r="5.2" fill="#E8272F" stroke="#1D1A2B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="42.4" cy="30.2" r="1.5" fill="#fff" opacity=".7"/><circle cx="20" cy="44" r="5.2" fill="#0A9BE3" stroke="#1D1A2B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="18.4" cy="42.2" r="1.5" fill="#fff" opacity=".7"/><circle cx="32" cy="44" r="5.2" fill="#E8272F" stroke="#1D1A2B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="30.4" cy="42.2" r="1.5" fill="#fff" opacity=".7"/><circle cx="44" cy="44" r="5.2" fill="#F6B800" stroke="#1D1A2B" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="42.4" cy="42.2" r="1.5" fill="#fff" opacity=".7"/>`
};
/** Ilustração do item como <svg> (tamanho em px). */
/* Fotos reais dos itens (PNG com fundo transparente). Para usar uma foto no lugar da ilustração,
   coloque o arquivo em img/itens/ e liste aqui, por exemplo: { dinos: 'img/itens/dinos.png' }.
   Tudo no site (cartões, brinquedoteca, telão) passa a usar a foto automaticamente. */
const FOTOS = {};
function iconeSvg(id, tam = 48){
  if (FOTOS[id]) return `<img src="${FOTOS[id]}" width="${tam}" height="${tam}" alt="" style="object-fit:contain">`;
  return `<svg viewBox="0 0 64 64" width="${tam}" height="${tam}" aria-hidden="true" focusable="false">${ICONES[id] || ''}</svg>`;
}
const _imgIcone = {};
/** Mesma imagem pronta para o canvas da brinquedoteca. */
function iconeImg(id){
  if (!_imgIcone[id] && FOTOS[id]){ const im = new Image(); im.src = FOTOS[id]; _imgIcone[id] = im; }
  if (!_imgIcone[id]){
    const im = new Image();
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="128" height="128">${ICONES[id] || ''}</svg>`);
    _imgIcone[id] = im;
  }
  return _imgIcone[id];
}
const itemPorId = id => ITENS.find(i => i.id === id);
const COR_HEX = { azul:'#0A9BE3', vermelho:'#E8272F', amarelo:'#F6B800', verde:'#3DAA3C', roxo:'#8E44B8', laranja:'#F28A12', rosa:'#DE3A98' };
const CORES = Object.keys(COR_HEX);

/* ---------- utilidades ---------- */
function soDigitos(s){ return String(s||'').replace(/\D+/g,''); }
function normalizaWhats(s){
  let d = soDigitos(s);
  if (d.startsWith('0')) d = d.replace(/^0+/,'');
  if (d.length === 10 || d.length === 11) d = '55' + d;
  return d;
}
function whatsValido(s){
  const d = normalizaWhats(s);
  if (!/^55\d{10,11}$/.test(d)) return false;
  const nacional = d.slice(2);
  if (nacional.length === 11 && nacional[2] !== '9') return false; // celular tem 9 na frente
  return true;
}
function mascaraWhats(valor){
  const d = soDigitos(valor).slice(0,11);
  if (d.length <= 2) return d ? '(' + d : '';
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}
function formataWhats(n){
  const d = soDigitos(n).replace(/^55/,'');
  return mascaraWhats(d);
}
function primeiroNome(n){ const p = String(n||'').trim().split(/\s+/)[0] || ''; return p.charAt(0).toUpperCase() + p.slice(1); }
function escapaHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* Confete de peças (canvas). */
function confete(canvas, ms = 2600){
  const ctx = canvas.getContext('2d');
  const r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = r.width * dpr; canvas.height = r.height * dpr;
  ctx.scale(dpr, dpr);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const W = r.width, H = r.height;
  const ps = Array.from({length: 90}, () => ({
    x: W / 2 + (Math.random() - .5) * 60, y: H * .4,
    vx: (Math.random() - .5) * 13, vy: -Math.random() * 14 - 4,
    s: 9 + Math.random() * 14, a: Math.random() * 6, va: (Math.random() - .5) * .35,
    c: COR_HEX[CORES[Math.floor(Math.random() * CORES.length)]]
  }));
  const t0 = performance.now();
  (function quadro(t){
    const dt = t - t0;
    ctx.clearRect(0, 0, W, H);
    ps.forEach(p => {
      p.vy += .42; p.x += p.vx; p.y += p.vy; p.a += p.va; p.vx *= .992;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.globalAlpha = Math.max(0, 1 - dt / ms);
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-p.s / 3, -p.s / 3, p.s * .66, p.s * .66);
      ctx.restore();
    });
    if (dt < ms) requestAnimationFrame(quadro); else ctx.clearRect(0, 0, W, H);
  })(t0);
}

/* "Clac" de peça magnética encaixando. */
let _audio;
function somEncaixe(){
  try{
    _audio = _audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = _audio.createOscillator(), g = _audio.createGain(), t = _audio.currentTime;
    o.type = 'triangle'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(180, t + .08);
    g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.001, t + .12);
    o.connect(g).connect(_audio.destination); o.start(t); o.stop(t + .13);
  }catch(e){}
  try{ navigator.vibrate && navigator.vibrate(18); }catch(e){}
}

/* ---------- banco de dados ---------- */
const FIREBASE_OK = !!(DOAR_CONFIG.firebaseConfig.apiKey && !DOAR_CONFIG.firebaseConfig.apiKey.startsWith('COLE_AQUI')) && typeof firebase !== 'undefined';
let fdb = null, fauth = null;
if (FIREBASE_OK){
  try{
    firebase.initializeApp(DOAR_CONFIG.firebaseConfig);
    fdb = firebase.firestore(); fauth = firebase.auth();
  }catch(e){ console.error('Outubro da Criança: erro ao iniciar o Firebase', e); }
}
const MODO_DEMO = !fdb;

const _canal = (!fdb && 'BroadcastChannel' in window) ? new BroadcastChannel('doar-demo') : null;
const _lsGet = (k, v) => { try{ return JSON.parse(localStorage.getItem(k)) ?? v; }catch(e){ return v; } };
const _lsSet = (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
const _ouvintes = new Set();
function _avisa(){ _ouvintes.forEach(f => f()); }
if (_canal) _canal.onmessage = _avisa;
window.addEventListener('storage', e => { if (e.key && e.key.startsWith('doar_')) _avisa(); });

const Dados = {
  demo: MODO_DEMO,

  /** Registra a doação. Devolve { numero } (a ordem da pessoa entre os doadores). */
  async enviar({ nome, whatsapp, itens, obs }){
    const lista = itens.map(id => ({ id, nome: itemPorId(id).nome }));
    const base = { nome: nome.trim(), whatsapp: normalizaWhats(whatsapp), itens: lista, obs: (obs || '').trim(), status: 'novo' };
    if (fdb){
      const ts = firebase.firestore.FieldValue.serverTimestamp();
      const resumoRef = fdb.doc('publico/resumo');
      const batch = fdb.batch();
      batch.set(fdb.collection('doacoes').doc(), { ...base, criadoEm: ts });
      const porItem = {}; lista.forEach(i => { porItem[i.id] = firebase.firestore.FieldValue.increment(1); });
      batch.set(resumoRef, { total: firebase.firestore.FieldValue.increment(1), porItem }, { merge: true });
      await batch.commit();
      let total = 0;
      try{ total = (await resumoRef.get()).data().total; }catch(e){}
      return { numero: total || undefined };
    }
    const doacoes = _lsGet('doar_doacoes', []);
    const agora = Date.now();
    doacoes.unshift({ id: 'd' + agora + Math.random().toString(36).slice(2, 5), ...base, criadoEm: agora });
    _lsSet('doar_doacoes', doacoes);
    _canal && _canal.postMessage('mudou'); _avisa();
    return { numero: doacoes.length };
  },

  /** Só números, ao vivo: total de doações e quantos de cada item. Nenhum nome é público. */
  aoVivoMural(cb){
    if (fdb){
      return fdb.doc('publico/resumo').onSnapshot(s => { const x = s.data() || {}; cb({ total: x.total || 0, porItem: x.porItem || {} }); }, console.error);
    }
    const f = () => {
      const l = _lsGet('doar_doacoes', []), porItem = {};
      l.forEach(d => d.itens.forEach(i => { porItem[i.id] = (porItem[i.id] || 0) + 1; }));
      cb({ total: l.length, porItem });
    };
    _ouvintes.add(f); f();
    return () => _ouvintes.delete(f);
  },

  /* ----- painel da liderança ----- */
  precisaLogin: !!fdb,
  aoMudarLogin(cb){
    if (fauth) return fauth.onAuthStateChanged(u => cb(u ? { email: u.email } : null));
    cb({ email: 'modo demonstração' }); return () => {};
  },
  entrar(email, senha){ return fauth.signInWithEmailAndPassword(email, senha); },
  sair(){ return fauth && fauth.signOut(); },

  aoVivoDoacoes(cb, erro){
    if (fdb){
      return fdb.collection('doacoes').orderBy('criadoEm', 'desc').onSnapshot(q => {
        cb(q.docs.map(d => { const x = d.data(); return { id: d.id, ...x, criadoEm: x.criadoEm ? x.criadoEm.toMillis() : Date.now() }; }));
      }, erro || console.error);
    }
    const f = () => cb(_lsGet('doar_doacoes', []));
    _ouvintes.add(f); f();
    return () => _ouvintes.delete(f);
  },
  async atualizar(id, patch){
    if (fdb) return fdb.collection('doacoes').doc(id).update(patch);
    const l = _lsGet('doar_doacoes', []); const x = l.find(d => d.id === id);
    if (x) Object.assign(x, patch); _lsSet('doar_doacoes', l); _canal && _canal.postMessage('mudou'); _avisa();
  },
  async limparDemo(){
    if (fdb) return;
    _lsSet('doar_doacoes', []); _canal && _canal.postMessage('mudou'); _avisa();
  }
};
