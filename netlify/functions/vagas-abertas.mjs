// Toda quarta às 18h (Brasília), olha os próximos 7 dias e avisa, por
// WhatsApp, os voluntários de cada departamento sobre as vagas que ainda
// estão sem ninguém escalado — assim quem tem disponibilidade pode se
// oferecer pelo app antes do líder precisar correr atrás de alguém.
// Recurso novo (não existia no Videira Kids): transforma vaga vazia em
// convite automático, em vez de depender só do líder montar a escala.
import {
  fsListCollection, isoDataBrasil, agoraBrasil, diaSemanaBrasil, gerarDatasDoMes,
  formatarDataBonitaPt, enviarWhatsAppTemplate, normalizarTelefoneBR,
} from './_lib.mjs';

function somarDias(isoData, dias) {
  const [ano, mes, dia] = isoData.split('-').map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia + dias));
  return d.toISOString().slice(0, 10);
}

export default async () => {
  try {
    const hojeStr = isoDataBrasil();
    const limiteStr = somarDias(hojeStr, 7);
    const templateName = process.env.WHATSAPP_TEMPLATE_VAGA_ABERTA || 'serve_vaga_aberta';

    const [configDoc, esporadicos, escalas, voluntarios] = await Promise.all([
      fsListCollection('dados').then((docs) => docs.find((d) => d._id === 'config')),
      fsListCollection('eventosEsporadicos'),
      fsListCollection('escalas'),
      fsListCollection('voluntarios'),
    ]);
    const configEventos = (configDoc && configDoc.value && configDoc.value.eventos) || [];
    const idMesAtual = hojeStr.slice(0, 7);
    const idMesSeguinte = limiteStr.slice(0, 7);
    const linhasBrutas = [
      ...gerarDatasDoMes(idMesAtual, configEventos, esporadicos),
      ...(idMesSeguinte !== idMesAtual ? gerarDatasDoMes(idMesSeguinte, configEventos, esporadicos) : []),
    ];
    const linhas = linhasBrutas.filter((l) => l.data >= hojeStr && l.data <= limiteStr);
    if (linhas.length === 0) {
      return new Response(JSON.stringify({ ok: true, motivo: 'nada nos próximos 7 dias' }), { headers: { 'Content-Type': 'application/json' } });
    }

    const departamentos = (configDoc && configDoc.value && configDoc.value.departamentos) || [];
    const voluntariosAtivos = voluntarios.filter((v) => v.ativo !== false && !v.notificacoesDesativadas && v.avisarVagaAberta !== false && v.telefone);

    let enviados = 0, falhas = 0;
    for (const dep of departamentos) {
      const vagasVazias = linhas.filter((linha) => {
        const temGente = escalas.some((i) => !i.excluida && i.status !== 'proposto' &&
          i.eventoTipo === linha.tipo && i.eventoId === linha.eventoId && i.data === linha.data && i.departamento === dep);
        return !temGente;
      });
      if (vagasVazias.length === 0) continue;
      const lista = vagasVazias.map((l) => '• ' + formatarDataBonitaPt(l.data) + ' — ' + l.eventoNome).join('\n');
      const interessados = voluntariosAtivos.filter((v) => (v.departamentos || []).includes(dep));
      for (const vol of interessados) {
        const jaEscaladoNaVaga = vagasVazias.some((l) => escalas.some((i) => !i.excluida && i.voluntarioUid === (vol._id || vol.uid) &&
          i.eventoTipo === l.tipo && i.eventoId === l.eventoId && i.data === l.data));
        if (jaEscaladoNaVaga) continue;
        const telefone = normalizarTelefoneBR(vol.telefone);
        const ok = await enviarWhatsAppTemplate(telefone, templateName, [vol.nome, dep, lista]);
        if (ok) enviados++; else falhas++;
      }
    }

    console.log(`Aviso de vagas abertas: ${enviados} enviados, ${falhas} falhas.`);
    return new Response(JSON.stringify({ ok: true, enviados, falhas }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Erro no aviso de vagas abertas:', e);
    return new Response(JSON.stringify({ ok: false, erro: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = { schedule: '0 21 * * 3' }; // 18h em Brasília, quartas-feiras
