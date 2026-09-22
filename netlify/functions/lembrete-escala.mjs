// Toda segunda e quinta às 9h (horário de Brasília), manda pra cada
// voluntário confirmado a lista dos compromissos que ainda faltam nele
// servir esse mês — assim ninguém esquece a escala.
import {
  fsListCollection, mesIdBrasil, isoDataBrasil, gerarDatasDoMes,
  formatarDataBonitaPt, nomeMesPt, enviarWhatsAppTemplate, normalizarTelefoneBR,
} from './_lib.mjs';

export default async () => {
  try {
    const idMes = mesIdBrasil(0);
    const hojeStr = isoDataBrasil();
    const templateName = process.env.WHATSAPP_TEMPLATE_LEMBRETE || 'serve_lembrete';

    const [configDoc, esporadicos, escalas, voluntarios] = await Promise.all([
      fsListCollection('dados').then((docs) => docs.find((d) => d._id === 'config')),
      fsListCollection('eventosEsporadicos'),
      fsListCollection('escalas'),
      fsListCollection('voluntarios'),
    ]);
    const configEventos = (configDoc && configDoc.value && configDoc.value.eventos) || [];
    const linhas = gerarDatasDoMes(idMes, configEventos, esporadicos).filter((l) => l.data >= hojeStr);

    const porVoluntario = {};
    escalas.forEach((i) => {
      if (i.excluida || i.status === 'proposto') return;
      const linha = linhas.find((l) => l.data === i.data && l.eventoId === i.eventoId && l.tipo === i.eventoTipo);
      if (!linha) return;
      if (!porVoluntario[i.voluntarioUid]) porVoluntario[i.voluntarioUid] = [];
      porVoluntario[i.voluntarioUid].push({ data: i.data, eventoNome: i.eventoNome, departamento: i.departamento });
    });

    let enviados = 0, falhas = 0;
    for (const uid of Object.keys(porVoluntario)) {
      const vol = voluntarios.find((v) => v._id === uid);
      if (!vol || !vol.telefone || vol.notificacoesDesativadas) continue;
      const compromissos = porVoluntario[uid].sort((a, b) => a.data.localeCompare(b.data));
      const lista = compromissos.map((c) => '• ' + formatarDataBonitaPt(c.data) + ' — ' + c.eventoNome + ' (' + c.departamento + ')').join('\n');
      const telefone = normalizarTelefoneBR(vol.telefone);
      const ok = await enviarWhatsAppTemplate(telefone, templateName, [vol.nome, lista]);
      if (ok) enviados++; else falhas++;
    }

    console.log(`Lembrete de escala (${nomeMesPt(idMes)}): ${enviados} enviados, ${falhas} falhas.`);
    return new Response(JSON.stringify({ ok: true, enviados, falhas }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Erro no lembrete de escala:', e);
    return new Response(JSON.stringify({ ok: false, erro: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = { schedule: '0 12 * * 1,4' }; // 9h em Brasília, segundas e quintas
