// Recebe o formulário do totem físico (sem login) e salva o contato pra
// equipe de acompanhamento. É a ÚNICA função HTTP sob demanda deste
// projeto — as outras 4 são agendadas — por isso não exporta
// "config.schedule": sem essa configuração, o Netlify já expõe essa função
// como um endpoint HTTP comum em /.netlify/functions/totem-contato.
import { fsSetDoc, fsGetDoc, fsNovoId, enviarWhatsAppTemplate, normalizarTelefoneBR } from './_lib.mjs';

const INTERESSES_VALIDOS = ['Quero conhecer a igreja', 'Grupo de crescimento', 'Oração', 'Outro'];

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

    // Avisa a equipe de acompanhamento — se não tiver telefones
    // configurados em "Mais" → "Configurações" ou faltar variável de
    // ambiente do WhatsApp, só pula o aviso: o contato já foi salvo.
    try {
      const configDoc = await fsGetDoc('dados/config');
      const telefonesEquipe = (configDoc && configDoc.equipeTotemTelefones) || [];
      if (telefonesEquipe.length) {
        const templateName = process.env.WHATSAPP_TEMPLATE_TOTEM || 'ccvserve_totem_contato';
        const resumo = interesses.length ? interesses.join(', ') : 'não especificado';
        await Promise.all(
          telefonesEquipe.map((tel) => enviarWhatsAppTemplate(normalizarTelefoneBR(tel), templateName, [nome, resumo, telefone]))
        );
      }
    } catch (notifyErr) {
      console.error('Totem: contato salvo, mas aviso à equipe falhou:', notifyErr);
    }

    return new Response(JSON.stringify({ ok: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Erro no totem-contato:', e);
    return new Response(JSON.stringify({ ok: false, erro: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
