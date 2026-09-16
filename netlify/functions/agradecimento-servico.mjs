// Roda a cada 15 minutos o dia inteiro. Assim que o ÚLTIMO compromisso do
// dia termina (usando horarioFim, ou horário de início + 90min se não tiver
// horarioFim cadastrado), manda uma mensagem de agradecimento + o versículo
// do dia pra quem serviu hoje E já fez o check-in (voluntário que faltou não
// recebe). Só manda uma vez por dia (guarda isso no próprio Firestore, num
// documento "carimbo").
import {
  fsListCollection, lerDados, salvarDados,
  agoraBrasil, isoDataBrasil, horaMinutoBrasil, diaSemanaBrasil, somarMinutos,
  enviarWhatsAppTemplate, normalizarTelefoneBR, versiculoDoDia,
} from './_lib.mjs';

export default async () => {
  try {
    const agora = agoraBrasil();
    const hojeStr = isoDataBrasil(agora);
    const horaAgora = horaMinutoBrasil(agora);
    const diaSemanaHoje = diaSemanaBrasil(agora);
    const templateName = process.env.WHATSAPP_TEMPLATE_AGRADECIMENTO || 'videira_serve_agradecimento';

    const [configDocs, esporadicos, escalas, voluntarios, marcadorEnvios] = await Promise.all([
      fsListCollection('dados'),
      fsListCollection('eventosEsporadicos'),
      fsListCollection('escalas'),
      fsListCollection('voluntarios'),
      lerDados('envios', {}),
    ]);
    if (marcadorEnvios.ultimoAgradecimento === hojeStr) {
      return new Response(JSON.stringify({ ok: true, motivo: 'já enviado hoje' }), { headers: { 'Content-Type': 'application/json' } });
    }

    const configDoc = configDocs.find((d) => d._id === 'config');
    const configEventos = (configDoc && configDoc.value && configDoc.value.eventos) || [];

    const eventosHoje = [
      ...configEventos.filter((ev) => (ev.dataEspecifica ? ev.dataEspecifica === hojeStr : ev.dia === diaSemanaHoje))
        .map((ev) => ({ tipo: 'recorrente', eventoId: ev.id, eventoNome: ev.nome, horario: ev.horario, horarioFim: ev.horarioFim })),
      ...esporadicos.filter((ev) => ev.data === hojeStr && !ev.excluido)
        .map((ev) => ({ tipo: 'esporadico', eventoId: ev._id, eventoNome: ev.nome, horario: ev.horario, horarioFim: ev.horarioFim })),
    ];
    if (eventosHoje.length === 0) {
      return new Response(JSON.stringify({ ok: true, motivo: 'nenhum compromisso hoje' }), { headers: { 'Content-Type': 'application/json' } });
    }

    const fimDeCada = eventosHoje.map((ev) => ev.horarioFim || somarMinutos(ev.horario, 90));
    const ultimoFim = fimDeCada.sort().slice(-1)[0];
    if (horaAgora < ultimoFim) {
      return new Response(JSON.stringify({ ok: true, motivo: 'último compromisso ainda não acabou', ultimoFim }), { headers: { 'Content-Type': 'application/json' } });
    }

    const idsEventosHoje = new Set(eventosHoje.map((ev) => ev.tipo + '|' + ev.eventoId));
    const uidsDeHoje = new Set();
    escalas.forEach((i) => {
      if (i.excluida || i.status === 'proposto' || i.data !== hojeStr) return;
      if (!idsEventosHoje.has(i.eventoTipo + '|' + i.eventoId)) return;
      if (!i.checkin) return; // só agradece quem realmente fez o check-in
      uidsDeHoje.add(i.voluntarioUid);
    });

    const versiculoDoc = await lerDados('versiculoDoDia', null);
    const versiculo = versiculoDoc && versiculoDoc.data === hojeStr ? versiculoDoc : versiculoDoDia(hojeStr);

    let enviados = 0, falhas = 0;
    for (const uid of uidsDeHoje) {
      const vol = voluntarios.find((v) => v._id === uid);
      if (!vol || !vol.telefone || vol.notificacoesDesativadas) continue;
      const telefone = normalizarTelefoneBR(vol.telefone);
      const ok = await enviarWhatsAppTemplate(telefone, templateName, [vol.nome, versiculo.texto, versiculo.referencia]);
      if (ok) enviados++; else falhas++;
    }

    await salvarDados('envios', { ...marcadorEnvios, ultimoAgradecimento: hojeStr });
    console.log(`Agradecimento pós-serviço (${hojeStr}): ${enviados} enviados, ${falhas} falhas.`);
    return new Response(JSON.stringify({ ok: true, enviados, falhas }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Erro no agradecimento pós-serviço:', e);
    return new Response(JSON.stringify({ ok: false, erro: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = { schedule: '*/15 * * * *' }; // a cada 15 minutos, o dia inteiro (a função mesma decide se já é hora de mandar)
