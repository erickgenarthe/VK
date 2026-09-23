// Recebe o formulário do totem físico (sem login) e salva o contato pra
// a equipe consultar depois em "Mais" → "Totem · Contatos". É a ÚNICA
// função HTTP sob demanda deste projeto — as outras 4 são agendadas — por
// isso não exporta "config.schedule": sem essa configuração, o Netlify já
// expõe essa função como um endpoint HTTP comum em
// /.netlify/functions/totem-contato.
import { fsSetDoc, fsNovoId, normalizarTelefoneBR } from './_lib.mjs';

const INTERESSES_VALIDOS = ['Quero aceitar Jesus', 'Quero conhecer a igreja', 'Grupo de crescimento', 'Oração', 'Quero falar sobre a mensagem de hoje'];

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, erro: 'Método não permitido.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const nome = String(body.nome || '').trim().slice(0, 120);
    const telefone = normalizarTelefoneBR(body.whatsapp);
    const interesses = Array.isArray(body.interesses) ? body.interesses.filter((i) => INTERESSES_VALIDOS.includes(i)) : [];
    const mensagem = String(body.mensagem || '').trim().slice(0, 500);

    if (!nome || !telefone) {
      return new Response(JSON.stringify({ ok: false, erro: 'Nome e WhatsApp são obrigatórios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const id = fsNovoId();
    await fsSetDoc('contatosTotem/' + id, {
      nome,
      telefone,
      interesses,
      mensagem,
      status: 'pendente',
      origem: 'totem',
      criadoEm: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ ok: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Erro no totem-contato:', e);
    return new Response(JSON.stringify({ ok: false, erro: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
