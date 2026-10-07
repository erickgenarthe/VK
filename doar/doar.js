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
  // Quantas peças tem a primeira torre. Passou disso, a torre cresce de 50 em 50.
  metaInicial: 50,
  // Mensagem enviada pelo painel ao chamar a pessoa no WhatsApp. {nome} e {itens} são trocados.
  mensagemWhats:
    'Oi, {nome}! Aqui é da Videira Kids 💛 Vimos que você quer doar para o Outubro da Criança: {itens}. ' +
    'Obrigado pelo carinho! Podemos combinar a melhor forma de você entregar ou enviar?'
};

/* Itens da lista "O que doar" (Tatames e abafadores/cubos infinitos foram riscados na lista, então ficam de fora). */
const ITENS = [
  { id:'pufes',      emoji:'🛋️', nome:'Pufes',                         detalhe:'',                                                              cor:'azul' },
  { id:'faz-de-conta',emoji:'🍳', nome:'Brinquedos de cozinha, salão, engenheiro e médico', detalhe:'Faz de conta',                           cor:'vermelho' },
  { id:'carros',     emoji:'🚚', nome:'Carros de brinquedo',           detalhe:'Grandes',                                                       cor:'amarelo' },
  { id:'dinos',      emoji:'🦖', nome:'Dinossauros',                   detalhe:'Grandes',                                                       cor:'verde' },
  { id:'bonecos',    emoji:'🦸', nome:'Bonecas Barbies e Bonecos de Super Heróis', detalhe:'',                                                  cor:'rosa' },
  { id:'esportivos', emoji:'🏀', nome:'Brinquedos esportivos',         detalhe:'Corda de pular, basquete, tiro ao alvo, boliche, pega bolinha', cor:'laranja' },
  { id:'papelaria',  emoji:'✏️', nome:'Itens de papelaria',            detalhe:'Lápis jumbo, canetões, cola bastão, tesoura, cartolina, EVA, TNT', cor:'roxo' },
  { id:'regulacao',  emoji:'🫧', nome:'Itens de regulação',            detalhe:'Pop its e massinhas',                                           cor:'azul' }
];
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
function metaDaTorre(total){ return Math.max(DOAR_CONFIG.metaInicial, Math.ceil((total + 1) / 50) * 50); }
function corDaPeca(n){ return CORES[n % CORES.length]; }

/* Desenha a torre. Reaproveita as células já existentes para a peça nova "cair" sozinha. */
function desenhaTorre(el, total, opts = {}){
  const meta = metaDaTorre(total);
  const cols = opts.cols || (meta <= 50 ? 10 : 10);
  el.style.setProperty('--cols', cols);
  const antes = Number(el.dataset.total || 0);
  const mesmoTamanho = el.children.length === meta;
  if (!mesmoTamanho){
    el.innerHTML = '';
    for (let i = 0; i < meta; i++){
      const c = document.createElement('div');
      c.className = 'cel';
      el.appendChild(c);
    }
  }
  // a torre sobe de baixo para cima: o índice 0 fica na linha de baixo
  const linhas = Math.ceil(meta / cols);
  for (let i = 0; i < meta; i++){
    const linha = Math.floor(i / cols), col = i % cols;
    const pos = (linhas - 1 - linha) * cols + col;
    const c = el.children[pos];
    const cheia = i < total;
    const jaCheia = c.classList.contains('cheia');
    if (cheia && !jaCheia){
      c.className = 'cel cheia peca c-' + corDaPeca(i) + (opts.animaNovas && i >= antes && mesmoTamanho ? ' nova' : '');
    } else if (!cheia && jaCheia){
      c.className = 'cel';
    }
  }
  el.dataset.total = total;
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', `${total} de ${meta} peças da torre`);
  return meta;
}

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

  /** Registra a doação. Devolve { numero } (a ordem da pessoa na torre). */
  async enviar({ nome, whatsapp, itens, obs }){
    const lista = itens.map(id => ({ id, nome: itemPorId(id).nome }));
    const base = { nome: nome.trim(), whatsapp: normalizaWhats(whatsapp), itens: lista, obs: (obs || '').trim(), status: 'novo' };
    const publico = { nome: primeiroNome(nome), item: lista.length === 1 ? lista[0].nome : `${lista[0].nome} + ${lista.length - 1}`, itemId: lista[0].id };
    if (fdb){
      const ts = firebase.firestore.FieldValue.serverTimestamp();
      const resumoRef = fdb.doc('publico/resumo');
      const batch = fdb.batch();
      batch.set(fdb.collection('doacoes').doc(), { ...base, criadoEm: ts });
      batch.set(fdb.collection('mural').doc(), { ...publico, criadoEm: ts });
      batch.set(resumoRef, { total: firebase.firestore.FieldValue.increment(1) }, { merge: true });
      await batch.commit();
      let total = 0;
      try{ total = (await resumoRef.get()).data().total; }catch(e){}
      return { numero: total || undefined };
    }
    const doacoes = _lsGet('doar_doacoes', []);
    const mural = _lsGet('doar_mural', []);
    const agora = Date.now();
    doacoes.unshift({ id: 'd' + agora, ...base, criadoEm: agora });
    mural.unshift({ id: 'm' + agora, ...publico, criadoEm: agora });
    _lsSet('doar_doacoes', doacoes); _lsSet('doar_mural', mural);
    _canal && _canal.postMessage('mudou'); _avisa();
    return { numero: doacoes.length };
  },

  /** Total de peças + últimas doações (só primeiro nome), ao vivo. */
  aoVivoMural(cb){
    if (fdb){
      let total = 0, ultimas = [];
      const emite = () => cb({ total, ultimas });
      const u1 = fdb.doc('publico/resumo').onSnapshot(s => { total = (s.data() || {}).total || 0; emite(); }, console.error);
      const u2 = fdb.collection('mural').orderBy('criadoEm', 'desc').limit(30).onSnapshot(q => {
        ultimas = q.docs.map(d => ({ id: d.id, ...d.data(), criadoEm: d.data().criadoEm ? d.data().criadoEm.toMillis() : Date.now() }));
        emite();
      }, console.error);
      return () => { u1(); u2(); };
    }
    const f = () => { const m = _lsGet('doar_mural', []); cb({ total: m.length, ultimas: m.slice(0, 30) }); };
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
    _lsSet('doar_doacoes', []); _lsSet('doar_mural', []); _canal && _canal.postMessage('mudou'); _avisa();
  }
};
