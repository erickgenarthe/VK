/* O Cubo de Doações: um cubo de blocos magnéticos que se enche de brinquedos.
   Cada doação solta no cubo o brinquedo que a pessoa escolheu; ele cai, quica e se acomoda.
   Encheu? O cubo comemora, esvazia e começa o próximo. Toque no cubo para sacudir os brinquedos.
   Coordenadas internas em "unidades de cubo": o lado da frente vale 1. */

const CUBO_ALTURA = 1.5;   // altura total do desenho (frente + borda de cima + espaço onde os brinquedos caem)
const CUBO_BORDA  = 0.045; // espessura da moldura de peças
const CUBO_RAIO   = 0.062; // raio de cada brinquedo

class Cubo {
  constructor(host, opts = {}){
    this.host = host; this.opts = opts;
    this.corpos = []; this.cuboAtual = null; this.primeira = true;
    this.rodando = false; this.calmo = 0; this.S = 0; this.onCheio = opts.onCheio || null;
    host.classList.add('cubo');
    host.innerHTML = '<div class="c-topo"></div><div class="c-lado"></div><div class="c-frente"></div><canvas></canvas>';
    this.cv = host.querySelector('canvas'); this.ctx = this.cv.getContext('2d');
    this.ro = new ResizeObserver(() => this.ajusta()); this.ro.observe(host.parentElement || host);
    this.ajusta();
    const toque = e => {
      const r = this.cv.getBoundingClientRect();
      this.sacode((e.clientX - r.left) / r.width, ((e.clientY - r.top) / r.height) * CUBO_ALTURA);
    };
    this.cv.addEventListener('pointerdown', e => { toque(e); try{ somEncaixe(); }catch(_){} });
    this.cv.addEventListener('pointermove', e => { if (e.buttons) toque(e); });
  }

  destroy(){ this.ro.disconnect(); this.rodando = false; this.host.innerHTML = ''; this.host.classList.remove('cubo'); }

  ajusta(){
    const pai = this.host.parentElement || this.host;
    let S = Math.min(pai.clientWidth / 1.2, this.opts.max || 320);
    if (this.opts.alturaMax) S = Math.min(S, pai.clientHeight / CUBO_ALTURA);
    S = Math.max(120, Math.floor(S));
    if (S === this.S) return;
    this.S = S; this.host.style.setProperty('--S', S + 'px');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = Math.round(S * dpr); this.cv.height = Math.round(S * CUBO_ALTURA * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.acorda();
  }

  /** Ajusta o cubo ao total de doações. `ultimas` (mais nova primeiro) diz qual brinquedo foi cada doação. */
  atualiza(total, ultimas = []){
    const cap = DOAR_CONFIG.metaInicial;
    const cubo = total > 0 ? Math.floor((total - 1) / cap) : 0;
    const n = total > 0 ? ((total - 1) % cap) + 1 : 0;
    const base = cubo * cap;
    const animar = !this.primeira;
    if (this.cuboAtual !== null && this.cuboAtual !== cubo) this.corpos = [];   // encheu e esvaziou
    this.cuboAtual = cubo;
    if (this.corpos.length > n) this.corpos.length = n;
    let atraso = 0;
    while (this.corpos.length < n){
      const k = this.corpos.length;
      const u = ultimas[total - (base + k + 1)];
      const id = u ? u.itemId : ITENS[((base + k) * 5) % ITENS.length].id;
      const c = this.novo(id, animar);
      if (animar){ c.espera = atraso; atraso += 0.28; }
    }
    this.primeira = false;
    this.total = total; this.n = n; this.cubo = cubo;
    if (!animar) this.assenta();
    else { this.acorda(); if (n === cap && this.onCheio) setTimeout(() => this.onCheio(cubo + 1), 1300 + atraso * 1000); }
  }

  novo(itemId, cai){
    const it = itemPorId(itemId) || ITENS[0];
    const lim = 1 - 2 * CUBO_BORDA - 2 * CUBO_RAIO;
    const c = {
      id: it.id, cor: COR_HEX[it.cor],
      x: CUBO_BORDA + CUBO_RAIO + Math.random() * lim,
      y: cai ? -0.15 : 0.3 + Math.random() * 0.9,
      vx: (Math.random() - .5) * .5, vy: cai ? .4 : 0, espera: 0
    };
    this.corpos.push(c); return c;
  }

  /** Deixa os brinquedos já assentados (usado ao abrir a página, sem animação). */
  assenta(){ for (let i = 0; i < 260; i++) this.passo(1 / 60); this.desenha(); this.calmo = 0; }

  sacode(px, py){
    const forte = px === undefined;
    this.corpos.forEach(c => {
      const dx = c.x - px, dy = c.y - py, d = Math.hypot(dx, dy) || .001;
      if (forte || d < .3){
        const f = forte ? 1 : (1 - d / .3);
        c.vx += (forte ? (Math.random() - .5) * 1.6 : dx / d * 1.8 * f);
        c.vy -= (forte ? 1.3 + Math.random() : 1.7 + 1.6 * f);
      }
    });
    this.acorda();
  }

  acorda(){ this.calmo = 0; if (!this.rodando){ this.rodando = true; this.t0 = performance.now(); requestAnimationFrame(t => this.quadro(t)); } }

  quadro(t){
    if (!this.cv.isConnected){ this.rodando = false; return; }
    const dt = Math.min(.05, (t - this.t0) / 1000); this.t0 = t;
    this.passo(dt); this.desenha();
    let ativo = false;
    for (const c of this.corpos){ if (c.espera > 0 || Math.abs(c.vx) + Math.abs(c.vy) > .06) { ativo = true; break; } }
    this.calmo = ativo ? 0 : this.calmo + 1;
    if (this.calmo > 45){ this.rodando = false; return; }
    requestAnimationFrame(t2 => this.quadro(t2));
  }

  passo(dt){
    const G = 3.4, B = CUBO_BORDA, R = CUBO_RAIO, piso = CUBO_ALTURA - B - R, esq = B + R, dir = 1 - B - R;
    const cs = this.corpos;
    for (const c of cs){
      if (c.espera > 0){ c.espera -= dt; continue; }
      c.vy += G * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.vx *= .998;
      if (c.x < esq){ c.x = esq; c.vx = Math.abs(c.vx) * .4; }
      if (c.x > dir){ c.x = dir; c.vx = -Math.abs(c.vx) * .4; }
      if (c.y > piso){ c.y = piso; c.vy = -Math.abs(c.vy) * .32; c.vx *= .9; if (Math.abs(c.vy) < .12) c.vy = 0; }
    }
    for (let it = 0; it < 2; it++){
      for (let i = 0; i < cs.length; i++){
        const a = cs[i]; if (a.espera > 0) continue;
        for (let j = i + 1; j < cs.length; j++){
          const b = cs[j]; if (b.espera > 0) continue;
          let dx = b.x - a.x, dy = b.y - a.y; const d2 = dx * dx + dy * dy, m = 2 * R * .96;
          if (d2 >= m * m || d2 === 0) continue;
          const d = Math.sqrt(d2); dx /= d; dy /= d; const p = (m - d) / 2;
          a.x -= dx * p; a.y -= dy * p; b.x += dx * p; b.y += dy * p;
          const vn = (b.vx - a.vx) * dx + (b.vy - a.vy) * dy;
          if (vn < 0){ const j2 = -vn * .55; a.vx -= dx * j2; a.vy -= dy * j2; b.vx += dx * j2; b.vy += dy * j2; }
          a.vx *= .995; b.vx *= .995;
        }
      }
    }
  }

  desenha(){
    const S = this.S, g = this.ctx, r = CUBO_RAIO * S;
    g.clearRect(0, 0, S, S * CUBO_ALTURA);
    for (const c of this.corpos){
      if (c.espera > 0) continue;
      const x = c.x * S, y = c.y * S;
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = c.cor; g.fill();
      g.beginPath(); g.arc(x, y, r * .78, 0, 7); g.fillStyle = 'rgba(255,255,255,.62)'; g.fill();
      const im = iconeImg(c.id);
      if (im.complete && im.naturalWidth) g.drawImage(im, x - r * .82, y - r * .82, r * 1.64, r * 1.64);
      else if (!im._espera){ im._espera = true; im.addEventListener('load', () => this.acorda()); }
    }
  }
}
