/* A Brinquedoteca: uma sala da Videira Kids que vai sendo montada pelas doações.
   Cada item doado vira um brinquedo na sala e ganha vida (carrinhos andam, dinossauros passeiam,
   bolas quicam, bonecos pulam). Não existe limite: quanto mais doações, mais cheia a sala, e os
   brinquedos encolhem para todo mundo caber. Toque num brinquedo ou no chão para a bagunça começar. */

const _frac = x => x - Math.floor(x);
const _tri = x => { const f = _frac(x); return f < .5 ? f * 2 : 2 - f * 2; };   // vai e volta entre 0 e 1

class Sala {
  constructor(host){
    this.host = host; host.classList.add('sala');
    this.cv = document.createElement('canvas'); host.appendChild(this.cv); this.g = this.cv.getContext('2d');
    this.por = {}; this.toys = []; this.parts = []; this.primeira = true;
    this.W = 0; this.H = 0; this.T = 0; this.vivo = true;
    this.faixa = new Image(); this.faixa.src = 'img/borda-topo.png';
    this.logo = new Image(); this.logo.src = 'img/logo-vk.png';
    this.ro = new ResizeObserver(() => this.ajusta()); this.ro.observe(host);
    this.ajusta();
    this.cv.addEventListener('pointerdown', e => this.toque(e));
    this.t0 = performance.now(); requestAnimationFrame(t => this.quadro(t));
  }

  destroy(){ this.vivo = false; this.ro.disconnect(); this.cv.remove(); this.host.classList.remove('sala'); }

  ajusta(){
    const r = this.host.getBoundingClientRect(), W = Math.round(r.width), H = Math.round(r.height);
    if (!W || !H || (W === this.W && H === this.H)) return;
    this.W = W; this.H = H;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cv.width = W * dpr; this.cv.height = H * dpr;
    this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.piso = H * .36;
  }

  /** `porItem` = quantos de cada item já foram doados. `nome` (opcional) aparece sobre o brinquedo que acabou de chegar. */
  atualiza(porItem, nome = null){
    const animar = !this.primeira, novos = [];
    ITENS.forEach((it, ix) => {
      const n = Math.max(0, Math.floor(porItem[it.id] || 0));
      const arr = this.por[it.id] || (this.por[it.id] = []);
      while (arr.length < n){ const t = this.novo(it, ix, arr.length, animar); arr.push(t); this.toys.push(t); novos.push(t); }
      if (arr.length > n){ const sobra = arr.splice(n); this.toys = this.toys.filter(t => !sobra.includes(t)); }
    });
    this.primeira = false;
    if (animar && novos.length){
      novos.forEach((t, i) => { t.espera = i * .3 + .001; if (nome && i < 3) t.nome = nome; });
    }
  }

  novo(it, ix, k, animar){
    return {
      id: it.id, ix, cor: COR_HEX[it.cor], img: iconeImg(it.id),
      hx: _frac(.13 + ix * .37 + (k + 1) * .6180339887),
      hy: _frac(.71 + ix * .21 + (k + 1) * .7548776662),
      fase: ix * 1.7 + k * 2.3, caindo: animar, dy: 0, vy: 0, espera: animar ? 0 : -1,
      pulo: null, nome: null, labelAte: 0, ex: 0, ey: 0, esz: 0
    };
  }

  toque(e){
    const r = this.cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    try{ somEncaixe(); }catch(_){}
    let acertou = false;
    for (const t of this.toys){
      const d = Math.hypot(t.ex - x, t.ey - t.esz * .5 - y);
      if (d < t.esz * .7){ acertou = true; t.pulo = 0; this.explode(t.ex, t.ey, t.cor, 6); }
      else if (d < this.W * .22 && !acertou){ t.pulo = -d / this.W * 1.4; }
    }
    if (!acertou) this.explode(x, y, '#F6B800', 5);
  }

  explode(x, y, cor, n){
    for (let i = 0; i < n; i++){
      const a = Math.random() * 6.283, v = 40 + Math.random() * 110;
      this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 70, vida: .7, c: i % 2 ? cor : COR_HEX[CORES[i % CORES.length]] });
    }
  }

  quadro(t){
    if (!this.vivo || !this.cv.isConnected) return;
    const dt = Math.min(.05, (t - this.t0) / 1000); this.t0 = t; this.T += dt;
    this.passo(dt); this.desenha();
    requestAnimationFrame(t2 => this.quadro(t2));
  }

  tamanho(){
    const n = Math.max(1, this.toys.length), area = this.W * (this.H - this.piso);
    return Math.max(16, Math.min(this.W * .2, Math.sqrt(area * .5 / n)));
  }

  passo(dt){
    for (const t of this.toys){
      if (t.espera > 0){ t.espera -= dt; if (t.espera <= 0){ t.espera = 0; t.dy = -this.H * 1.1; t.vy = 0; } continue; }
      if (t.caindo){
        t.vy += this.H * 3.4 * dt; t.dy += t.vy * dt;
        if (t.dy >= 0){
          t.dy = 0;
          if (t.vy > this.H * .5){ t.vy = -t.vy * .3; this.explode(t.ex, t.ey, t.cor, 10); try{ somEncaixe(); }catch(_){} }
          else { t.caindo = false; t.vy = 0; if (t.nome) t.labelAte = this.T + 4.5; }
        }
        if (t.nome && t.labelAte === 0) t.labelAte = this.T + 6;
      }
      if (t.pulo !== null){ t.pulo += dt; if (t.pulo > .6) t.pulo = null; }
    }
    for (const p of this.parts){ p.vy += 380 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vida -= dt; }
    this.parts = this.parts.filter(p => p.vida > 0);
  }

  /** O jeito de cada brinquedo se mexer. */
  jeito(t, sz){
    const T = this.T, f = t.fase, W = this.W;
    const o = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1, flip: false, sombra: 1, x: null };
    switch (t.id){
      case 'pufes': o.sy = 1 + .035 * Math.sin(T * 1.6 + f); o.sx = 1 - .02 * Math.sin(T * 1.6 + f); break;
      case 'faz-de-conta': { const p = (T + f) % 3.2; if (p < .5) o.dy = -Math.sin(p / .5 * Math.PI) * .5 * sz; break; }
      case 'carros': { const u = T * .045 + f; o.x = W * (.07 + .86 * _tri(u)); o.flip = _frac(u) > .5; o.dy = Math.sin(T * 14 + f) * sz * .012; break; }
      case 'dinos': { const u = T * .25 + f; o.dx = Math.sin(u) * W * .1; o.flip = Math.cos(u) < 0; o.dy = -Math.abs(Math.sin(T * 3.2 + f)) * sz * .07; break; }
      case 'bonecos': { const p = (T + f) % 2.4; if (p < .6) o.dy = -Math.sin(p / .6 * Math.PI) * .95 * sz; break; }
      case 'esportivos': { const b = Math.abs(Math.sin((T + f) * 2.8)); o.dy = -b * 1.4 * sz; o.sombra = 1 - b * .55; if (b < .12){ o.sy = .85; o.sx = 1.12; } break; }
      case 'papelaria': o.rot = Math.sin(T * 1.8 + f) * .2; break;
      case 'regulacao': { const s = 1 + .07 * Math.sin(T * 5 + f); o.sx = o.sy = s; break; }
    }
    if (t.pulo !== null && t.pulo >= 0) o.dy -= Math.sin(t.pulo / .6 * Math.PI) * 1.1 * sz;
    return o;
  }

  desenha(){
    const g = this.g, W = this.W, H = this.H, piso = this.piso;
    if (!W) return;
    this.fundo(g, W, H, piso);
    const base = this.tamanho(), lista = [];
    for (const t of this.toys){
      if (t.espera !== 0 && t.espera !== -1) continue;
      const yb = piso + H * .05 + t.hy * (H - piso - H * .08);
      const sc = .72 + .28 * ((yb - piso) / (H - piso));
      lista.push([t, yb, base * sc]);
    }
    lista.sort((a, b) => a[1] - b[1]);
    for (const [t, yb, sz] of lista){
      const o = this.jeito(t, sz);
      const x = o.x !== null ? o.x : W * .06 + t.hx * W * .88 + o.dx;
      t.ex = x; t.ey = yb; t.esz = sz;
      g.fillStyle = 'rgba(29,26,43,.16)';
      g.beginPath(); g.ellipse(x, yb, sz * .38 * o.sombra, sz * .09 * o.sombra, 0, 0, 7); g.fill();
      if (!t.img.complete || !t.img.naturalWidth) continue;
      g.save(); g.translate(x, yb + o.dy + t.dy); g.rotate(o.rot); g.scale((o.flip ? -1 : 1) * o.sx, o.sy);
      g.drawImage(t.img, -sz / 2, -sz * .96, sz, sz); g.restore();
    }
    for (const p of this.parts){
      g.globalAlpha = Math.max(0, p.vida / .7); g.fillStyle = p.c; g.fillRect(p.x - 3, p.y - 3, 6, 6);
    }
    g.globalAlpha = 1;
    for (const [t, , sz] of lista){
      if (t.nome && this.T < t.labelAte && !t.caindo) this.rotulo(g, t, sz);
    }
  }

  rotulo(g, t, sz){
    const txt = t.nome, fs = Math.max(13, Math.min(22, this.W * .045));
    g.font = `700 ${fs}px Rubik,system-ui,sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const w = g.measureText(txt).width + 18, h = fs + 10;
    const x = Math.max(w / 2 + 4, Math.min(this.W - w / 2 - 4, t.ex)), y = t.ey - sz * 1.15 - 6;
    g.globalAlpha = Math.min(1, (t.labelAte - this.T) * 2);
    g.fillStyle = '#1D1A2B'; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.fill();
    g.fillStyle = '#fff'; g.fillText(txt, x, y + 1); g.globalAlpha = 1;
  }

  fundo(g, W, H, piso){
    const parede = g.createLinearGradient(0, 0, 0, piso);
    parede.addColorStop(0, '#FFF6E8'); parede.addColorStop(1, '#F8E3C4');
    g.fillStyle = parede; g.fillRect(0, 0, W, piso);
    // faixa de peças no alto da parede
    const fh = Math.max(12, H * .07);
    if (this.faixa.complete && this.faixa.naturalWidth){
      const fw = this.faixa.naturalWidth * (fh / this.faixa.naturalHeight);
      for (let x = 0; x < W; x += fw) g.drawImage(this.faixa, x, 0, fw, fh);
    }
    // logo na parede
    if (this.logo.complete && this.logo.naturalWidth){
      const lh = (piso - fh) * .62, lw = this.logo.naturalWidth * (lh / this.logo.naturalHeight);
      g.drawImage(this.logo, W / 2 - lw / 2, fh + (piso - fh - lh) / 2 - H * .01, lw, lh);
    }
    // rodapé de peças coloridas
    const n = 9, rw = W / n, rh = H * .035;
    for (let i = 0; i < n; i++){
      g.fillStyle = COR_HEX[CORES[i % CORES.length]]; g.beginPath(); g.roundRect(i * rw + 1, piso - rh, rw - 2, rh, 4); g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(i * rw + 4, piso - rh + 3, rw - 8, rh * .3);
    }
    // piso de tatame colorido
    g.fillStyle = '#FBEFD9'; g.fillRect(0, piso, W, H - piso);
    const s = W / 7, linhas = Math.ceil((H - piso) / s) + 1;
    for (let r = 0; r < linhas; r++) for (let c = 0; c < 7; c++){
      g.fillStyle = COR_HEX[CORES[(r * 2 + c) % CORES.length]]; g.globalAlpha = .17;
      g.fillRect(c * s + 2, piso + r * s + 2, s - 4, s - 4);
    }
    g.globalAlpha = 1;
    const sombra = g.createLinearGradient(0, piso, 0, piso + H * .08);
    sombra.addColorStop(0, 'rgba(29,26,43,.16)'); sombra.addColorStop(1, 'rgba(29,26,43,0)');
    g.fillStyle = sombra; g.fillRect(0, piso, W, H * .08);
  }
}
