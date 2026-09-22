// Toda terça e todo sábado às 20h (Brasília), manda pra cada líder um resumo
// de como está a escala do departamento dele pro resto do mês — quantos
// compromissos já têm gente confirmada e quais ainda estão vazios.
import {
  fsListCollection, mesIdBrasil, isoDataBrasil, gerarDatasDoMes,
  formatarDataBonitaPt, nomeMesPt, enviarWhatsAppTemplate, normalizarTelefoneBR,
} from './_lib.mjs';

export default async () => {
  try {
    const idMes = mesIdBrasil(0);
    const hojeStr = isoDataBrasil();
    const templateName = process.env.WHATSAPP_TEMPLATE_STATUS_LIDER || 'serve_status_lider';

    const [configDoc, esporadicos, escalas, voluntarios] = await Promise.all([
      fsListCollection('dados').then((docs) => docs.find((d) => d._id === 'config')),
      fsListCollection('eventosEsporadicos'),
      fsListCollection('escalas'),
      fsListCollection('voluntarios'),
    ]);
    const configEventos = (configDoc && configDoc.value && configDoc.value.eventos) || [];
    const linhas = gerarDatasDoMes(idMes, configEventos, esporadicos).filter((l) => l.data >= hojeStr);
    const lideres = voluntarios.filter((v) => (v.role === 'lider' || v.role === 'admin') && (v.departamentos || []).length > 0);

    let enviados = 0, falhas = 0;
    for (const lider of lideres) {
      if (!lider.telefone || lider.notificacoesDesativadas) continue;
      const partesPorDepartamento = [];
      (lider.departamentos || []).forEach((dep) => {
        const vazios = linhas.filter((linha) => {
          const temGente = escalas.some((i) => !i.excluida && i.status !== 'proposto' &&
            i.eventoTipo === linha.tipo && i.eventoId === linha.eventoId && i.data === linha.data && i.departamento === dep);
          return !temGente;
        });
        const preenchidos = linhas.length - vazios.length;
        if (vazios.length === 0) {
          partesPorDepartamento.push(dep + ': tudo preenchido (' + preenchidos + '/' + linhas.length + ') 🎉');
        } else {
          const lista = vazios.map((l) => '  • ' + formatarDataBonitaPt(l.data) + ' — ' + l.eventoNome).join('\n');
          partesPorDepartamento.push(dep + ': ' + preenchidos + '/' + linhas.length + ' preenchidos — ainda faltam:\n' + lista);
        }
      });
      if (partesPorDepartamento.length === 0) continue;
      const resumo = partesPorDepartamento.join('\n\n');
      const telefone = normalizarTelefoneBR(lider.telefone);
      const ok = await enviarWhatsAppTemplate(telefone, templateName, [lider.nome, (lider.departamentos || []).join(', '), resumo]);
      if (ok) enviados++; else falhas++;
    }

    console.log(`Status pros líderes (${nomeMesPt(idMes)}): ${enviados} enviados, ${falhas} falhas.`);
    return new Response(JSON.stringify({ ok: true, enviados, falhas }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Erro no status pros líderes:', e);
    return new Response(JSON.stringify({ ok: false, erro: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const config = { schedule: '0 23 * * 2,6' }; // 20h em Brasília, terças e sábados
