import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as L from '../lib.js';
import { WORDS, SUPERVISOR_TEMPLATES } from '../content.js';
const fx = (n) => readFileSync(new URL('./fixtures/' + n, import.meta.url), 'utf8');

test('nextSunday: domingo é o próprio dia', () => {
  assert.equal(L.fmtDate(L.nextSunday(new Date(2026, 10, 22))), '22.11.26');
  assert.equal(L.fmtDate(L.nextSunday(new Date(2026, 10, 23))), '29.11.26');
  assert.equal(L.fmtDate(L.nextSunday(new Date(2026, 10, 25))), '29.11.26');
});

test('formatSunday', () => {
  const d = L.defaultState().sunday;
  d.counts.ARCA = [9, 0, 0, 0];
  const t = L.formatSunday(d, new Date(2026, 10, 22));
  assert.ok(t.startsWith('*ESCALA DE DOMINGO: 22.11.26 > VIDEIRA KIDS VOLUTS*'));
  assert.ok(t.includes('*ARCA*'));
  assert.ok(t.includes('09h - 09 voluntárias'));
  assert.ok(t.includes('11h - 00 voluntárias ❌'));
});

test('formatQDE', () => {
  const q = L.defaultState().qde;
  q.NINHO = { lider: 'Maria Eduarda', voluntarios: ['Anna Victoria'] };
  const t = L.formatQDE(q);
  assert.ok(t.includes('*NINHO*'));
  assert.ok(t.includes('Líder - Maria Eduarda'));
  assert.ok(t.includes('*REINO*\nLíder -\n'));
});

test('parse domingo', () => {
  const r = L.parseSchedule(fx('domingo.txt'));
  assert.equal(r.kind, 'domingo');
  assert.deepEqual(r.data.counts.NINHO, [4, 3, 3, 2]);
  assert.deepEqual(r.data.counts.REINO, [1, 0, 1, 1]);
  assert.deepEqual(r.data.counts['LÍDER DE CULTO'], [0, 0, 0, 0]);
  assert.deepEqual(r.data.counts.CONNECT, [2, 4, 2, 0]);
  assert.deepEqual(r.data.comunicadores.entrega, ['Liliane', 'Sara', 'Áurea', 'Joalba']);
  assert.deepEqual(r.data.comunicadores.ninhoArca, ['', 'Livinha', 'Andreia', 'AnaLu']);
  assert.equal(r.data.producao[1], 'Bia');
  assert.equal(r.date, '22.11.26');
});

test('parse qde', () => {
  const r = L.parseSchedule(fx('qde.txt'));
  assert.equal(r.kind, 'qde');
  assert.equal(r.data.NINHO.lider, 'Maria Eduarda');
  assert.deepEqual(r.data.NINHO.voluntarios, ['Anna Victoria']);
  assert.deepEqual(r.data.ARCA.voluntarios, ['Emilly']);
  assert.equal(r.data.REINO.lider, '');
  assert.equal(r.data.COMUNICADORES.entrega, 'Ítala');
});

test('parse erros', () => {
  assert.throws(() => L.parseSchedule('  '), /Texto vazio/);
  assert.throws(() => L.parseSchedule('oi tudo bem'), /Formato não reconhecido/);
});

test('content', () => {
  assert.equal(WORDS.length, 52);
  for (const w of WORDS) assert.ok(w.verse && w.ref && w.wisdom);
  const ids = SUPERVISOR_TEMPLATES.map((t) => t.id);
  for (const id of ['pedido', 'lembrete', 'sala', 'vaga', 'agradecimento', 'confirmacao']) assert.ok(ids.includes(id));
  assert.ok(SUPERVISOR_TEMPLATES.find((t) => t.id === 'sala').texto.includes('{qtd}'));
});

test('fillTemplate / wordOfWeek / palavra / planner', () => {
  assert.equal(L.fillTemplate('Oi {nome}', { nome: 'Ana' }), 'Oi Ana');
  assert.equal(L.fillTemplate('Oi {x}', {}), 'Oi {x}');
  const a = L.wordOfWeek(WORDS, new Date(2026, 10, 23));
  assert.deepEqual(a, L.wordOfWeek(WORDS, new Date(2026, 10, 29)));
  assert.notDeepEqual(a, L.wordOfWeek(WORDS, new Date(2026, 10, 30)));
  assert.ok(L.formatPalavra(a).includes(a.ref));
  const p = L.formatPlanner(L.defaultState().events, new Date(2026, 10, 23));
  assert.ok(/Terça[\s\S]*Gerar escala QDE/.test(p));
  assert.ok(p.includes('Domingo'));
});

test('estado e wa', () => {
  const mem = (init) => ({ getItem: () => init, setItem(k, v) { this.v = v; } });
  assert.deepEqual(L.loadState(mem(null)), L.defaultState());
  assert.deepEqual(L.loadState(mem('{bad')), L.defaultState());
  assert.deepEqual(L.loadState({ getItem() { throw new Error('x'); } }), L.defaultState());
  const s = L.defaultState(); s.contatos.push({ nome: 'A', funcao: 'supervisor', ministerio: 'ARCA', telefone: '1' });
  const st = mem(null); L.saveState(st, s);
  assert.deepEqual(L.loadState(mem(st.v)), s);
  assert.equal(L.waLink('(84) 99958-6104', 'oi'), 'https://wa.me/5584999586104?text=oi');
  assert.equal(L.waLink(null, 'a b'), 'https://wa.me/?text=a%20b');
  assert.throws(() => L.importBackup('{'), /Backup inválido/);
  assert.deepEqual(L.importBackup(L.exportBackup(s)), s);
});
