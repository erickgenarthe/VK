// Leitor de licenças IDEMA/RN — extrai dados da licença e classifica condicionantes monitoráveis.
// Funciona no navegador (window.LicParser) e no Node (module.exports).
(function (root) {
  const MESES = (n) => n;
  const NUM = { dez: 10, trinta: 30, sessenta: 60, noventa: 90 };

  const NOISE = [
    /Ass\. digital:.*?\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/g,
    /Recebimento eletr[ôo]nico pelo COMUNIC@ em:\s*\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/g,
    /Consulte essa licen[çc]a em:\s*\S+\s*,?\s*informando o c[óo]digo:\s*\S+/g,
    /https?:\/\/siga\.idema\S*/g,
    /Av\. Alm\. Alexandrino de Alencar, 1701, Tirol,?(\s*CEP 59015-350,?)?\s*(Natal-RN)?/g,
    /CEP 59015-350,?\s*Natal-RN,?/g,
    /Tel:\s*\(84\)\s*3113-6100(\s*\|)?\s*CNPJ:\s*08\.242\.166\.0001-26/g,
    /Website:\s*\S+/g,
    /E-mail:\s*\S+/g,
    /Governo do Estado do Rio Grande do Norte\s*Secretaria de Estado do Meio Ambiente e Recursos H[íi]dricos\s*Instituto de Desenvolvimento Sustent[áa]vel\s*e Meio Ambiente do Rio Grande do Norte/g,
    /Powered by TCPDF \(www\.tcpdf\.org\)/g,
    /Natal\(RN\),\s*\d{2}\/\d{2}\/\d{4}/g,
  ];

  const flat = (s) => s.replace(/\s+/g, ' ').trim();
  const pad = (n) => String(n).padStart(2, '0');
  const brToIso = (br) => { const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(br || ''); return m ? `${m[3]}-${m[2]}-${m[1]}` : ''; };
  function addMonthsIso(iso, n) {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1 + n, 1));
    const last = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate();
    dt.setUTCDate(Math.min(d, last));
    return dt.toISOString().slice(0, 10);
  }
  function addDaysIso(iso, n) {
    const dt = new Date(iso + 'T00:00:00Z'); dt.setUTCDate(dt.getUTCDate() + n); return dt.toISOString().slice(0, 10);
  }

  // Categorias monitoráveis. mode: 'periodico' (a cada N meses desde a última entrega),
  // 'validade' (vence na validade do documento anexado), 'unica' (prazo único após a emissão), 'derivado'.
  const CATS = {
    TOG:        { nome: 'Análise de Óleos e Graxas (TOG) — trimestral', curto: 'Teor de Óleos e Graxas (TOG)', modo: 'periodico', meses: 3, docs: 'resultados das análises trimestrais do Teor de Óleos e Graxas (TOG) do efluente tratado na Caixa Separadora de Água e Óleo (CSAO)' },
    LAUDO:      { nome: 'Laudo de Estanqueidade/Integridade', curto: 'Laudo de Estanqueidade/Integridade do SASC', modo: 'periodico', meses: 60, docs: 'Laudo de Estanqueidade/Integridade do sistema de armazenamento subterrâneo de combustíveis (SASC) e respectivas tubulações, emitido por empresa certificada pelo INMETRO' },
    AVCB:       { nome: 'AVCB — Corpo de Bombeiros', curto: 'AVCB — Atestado de Vistoria do Corpo de Bombeiros', modo: 'validade', docs: 'Atestado de Vistoria do Corpo de Bombeiros (AVCB) renovado' },
    INMETRO:    { nome: 'Certificado de Conformidade das bombas (INMETRO)', curto: 'Certificado de Conformidade das bombas (INMETRO)', modo: 'validade', docs: 'Certificado de Conformidade das bombas de combustíveis, emitido pelo INMETRO' },
    ANP:        { nome: 'Certificado de Posto Revendedor (ANP)', curto: 'Certificado de Posto Revendedor (ANP)', modo: 'validade', docs: 'Certificado de Posto Revendedor para combustíveis automotivos, emitido pela ANP' },
    TREINAMENTO:{ nome: 'Certificados de treinamento dos funcionários', curto: 'Certificados de Treinamento Teórico e Prático', modo: 'validade', docs: 'Certificados de Treinamento Teórico e Prático em Operação, Manutenção e Resposta a Incidentes dos funcionários' },
    PLACA:      { nome: 'Placa indicativa do empreendimento', curto: 'Placa indicativa do empreendimento licenciado', modo: 'unica', docs: 'registro fotográfico da placa indicativa do empreendimento licenciado' },
    PUBLICACAO: { nome: 'Publicação da licença (D.O.E. e jornal)', curto: 'Publicação da concessão da licença', modo: 'unica', docs: 'cópia comprobatória da publicação da concessão da licença no Diário Oficial do Estado e em periódico de grande circulação' },
    RENOVACAO:  { nome: 'Requerimento de renovação da licença', curto: 'Requerimento de renovação da Licença de Operação', modo: 'derivado', docs: 'requerimento de renovação da Licença de Operação' },
    PGRS:       { nome: 'PGRS — reapresentação de alterações', curto: 'Plano de Gerenciamento de Resíduos Sólidos (PGRS)', modo: 'evento', docs: 'alterações ocorridas no Plano de Gerenciamento de Resíduos Sólidos (PGRS)' },
  };

  function diasDe(txt) {
    const m = /(?:prazo(?: m[áa]ximo)? de|no prazo de)\s*(\d+)\s*\(/i.exec(txt);
    return m ? parseInt(m[1], 10) : null;
  }

  function classify(num, txt) {
    const t = txt.toLowerCase();
    const out = [];
    const base = { numero: num, texto: txt };
    // Condicionante com sub-itens a) b) c) — "manter atualizados"
    const subs = txt.split(/\s(?=[a-c]\)\s)/);
    const parts = subs.length > 1 ? subs : [txt];
    const head = parts[0];
    const hasSubs = parts.length > 1;
    const mantem = /manter .*atualizad/i.test(head);
    const kinds = [];
    const test = (s) => {
      const l = s.toLowerCase();
      if (/laudo de estanqueidade/.test(l)) kinds.push('LAUDO');
      if (/certificado de conformidade.*(bombas|inmetro)/.test(l)) kinds.push('INMETRO');
      if (/certificado de posto revendedor/.test(l)) kinds.push('ANP');
    };
    if (hasSubs) parts.slice(1).forEach((p) => { const k0 = kinds.length; test(p); if (kinds.length > k0) out.push({ ...base, cat: kinds[kinds.length - 1], subitem: p.slice(0, 2), recorrente: mantem, dias: diasDe(head), texto: (head + ' ' + p).trim() }); });
    else test(txt);
    if (!hasSubs) {
      kinds.forEach((c) => out.push({ ...base, cat: c, recorrente: false, dias: diasDe(txt), periodoMeses: /60 \(sessenta\) meses/.test(txt) ? 60 : null }));
    }
    if (/teor de [óo]leos e graxas/.test(t)) out.push({ ...base, cat: 'TOG', dias: null });
    if (/\bavcb\b/.test(t) && /apresentar a este instituto sempre que renovado/.test(t)) out.push({ ...base, cat: 'AVCB', dias: null });
    if (/certificados? de treinamento/.test(t)) out.push({ ...base, cat: 'TREINAMENTO', recorrente: /manter .*atualizad/.test(t), dias: diasDe(txt) });
    if (/placa indicativa/.test(t)) out.push({ ...base, cat: 'PLACA', dias: diasDe(txt) });
    if (/publicar a concess[ãa]o/.test(t)) out.push({ ...base, cat: 'PUBLICACAO', dias: diasDe(txt) });
    if (/plano de gerenciamento de res[íi]duos/.test(t)) out.push({ ...base, cat: 'PGRS', dias: null });
    if (/tem validade de .*renova[çc][ãa]o/.test(t)) out.push({ ...base, cat: 'RENOVACAO', dias: 120 });
    return out;
  }

  function parse(rawText, fileName) {
    let s = flat(rawText);
    const warn = [];
    const pick = (re) => { const m = re.exec(s); return m ? m[1].trim() : ''; };

    const numero = pick(/N[º°o]\s*(\d{4}-\d+\/[A-Z]+\/[A-Z]+-\d+)/);
    const tipo = /RENOVA[ÇC][ÃA]O DE LICEN[ÇC]A DE OPERA[ÇC][ÃA]O/.test(s) ? 'Renovação de Licença de Operação'
      : /LICEN[ÇC]A DE OPERA[ÇC][ÃA]O/.test(s) ? 'Licença de Operação'
      : /LICEN[ÇC]A PR[ÉE]VIA/.test(s) ? 'Licença Prévia'
      : /LICEN[ÇC]A DE INSTALA[ÇC][ÃA]O/.test(s) ? 'Licença de Instalação' : 'Licença';
    const empreendedor = pick(/Nome do Empreendedor\s+(.+?)\s+CPF\/CNPJ/);
    const cnpj = pick(/CPF\/CNPJ\s+([\d.\/-]+)/);
    const ie = pick(/I\.E\.:\s*([\d.\-]+)/);
    let endereco = pick(/Endere[çc]o do Empreendedor:\s*(.+?)\s+Endere[çc]o do\b/);
    const caract = pick(/Caracteriza[çc][ãa]o do Empreendimento:\s*(.+?)\s+CONDICIONANTES/);
    const recebimento = brToIso(pick(/Recebimento eletr[ôo]nico pelo COMUNIC@ em:\s*(\d{2}\/\d{2}\/\d{4})/)) ||
      brToIso(pick(/Natal\(RN\),\s*(\d{2}\/\d{2}\/\d{4})/));
    let validade = brToIso(pick(/Data de Validade:\s*(\d{2}\/\d{2}\/\d{4})/));
    let validadeEstimada = false;
    if (!validade && recebimento) { validade = addMonthsIso(recebimento, 72); validadeEstimada = true; warn.push('Data de validade não consta no PDF: calculada como 6 anos a partir do recebimento.'); }
    const codigo = pick(/informando o c[óo]digo:\s*([A-Z0-9-]+)/);
    // município (UF)
    const mun = /Munic[íi]pio de ([^,.\/]+?)(?:\s*\/\s*([A-Z]{2}))?[.,]/.exec(endereco + '.') ||
      /([A-ZÀ-Ú][\wÀ-ú ]+?)\/RN/.exec(endereco);
    let municipio = '';
    if (mun) municipio = mun[1].replace(/^.*Munic[íi]pio de /, '').trim();
    if (!municipio) { const m2 = /,\s*([^,\/]+)\/RN/.exec(endereco); if (m2) municipio = m2[1].trim(); }

    // Condicionantes: remove ruído e fatia sequencialmente (1., 2., 3. ...)
    const ci = s.indexOf('CONDICIONANTES');
    let body = ci >= 0 ? s.slice(ci + 'CONDICIONANTES'.length) : s;
    NOISE.forEach((re) => { body = body.replace(re, ' '); });
    body = flat(body);
    const itens = [];
    let pos = 0, n = 1;
    const starts = [];
    for (;;) {
      const re = new RegExp('(?:^|\\s)' + n + '\\.\\s+(?=\\S)');
      const m = re.exec(body.slice(pos));
      if (!m) break;
      starts.push({ n, i: pos + m.index + m[0].length - 0, head: pos + m.index });
      pos = pos + m.index + m[0].length;
      n++;
    }
    starts.forEach((st, k) => {
      const end = k + 1 < starts.length ? starts[k + 1].head : body.length;
      itens.push({ numero: st.n, texto: flat(body.slice(st.i, end)) });
    });

    let conds = [];
    itens.forEach((it) => { conds = conds.concat(classify(it.numero, it.texto)); });

    if (!numero) warn.push('Número da licença não identificado.');
    if (!empreendedor) warn.push('Nome do empreendedor não identificado.');
    if (!itens.length) warn.push('Nenhuma condicionante identificada (PDF escaneado? Nesse caso, cadastre manualmente).');

    return { arquivo: fileName || '', numero, tipo, empreendedor, cnpj, ie, endereco, municipio, caracterizacao: caract,
      recebimento, validade, validadeEstimada, codigoValidacao: codigo, condicionantes: itens, monitoradas: conds, avisos: warn };
  }


  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const DEFAULT_MESES = { TOG: 3, LAUDO: 60, AVCB: 12, INMETRO: 12, ANP: 3, TREINAMENTO: 12 };

  // Consolida as condicionantes classificadas em UM item monitorado por categoria.
  function buildItens(p) {
    const groups = {};
    p.monitoradas.forEach((m) => { (groups[m.cat] = groups[m.cat] || []).push(m); });
    const itens = [];
    Object.keys(groups).forEach((cat) => {
      const refs = groups[cat];
      const def = CATS[cat];
      const rec = refs.find((r) => r.recorrente) || refs[0];
      const unica = refs.filter((r) => !r.recorrente && r.dias);
      const fixo = refs.find((r) => r.periodoMeses);
      const prazoRef = def.modo === 'unica' ? refs.find((r) => r.dias) : unica[0];
      const item = {
        id: uid(), cat, nome: def.nome, modo: def.modo,
        periodoMeses: fixo ? fixo.periodoMeses : (DEFAULT_MESES[cat] || null),
        condRefs: [rec].concat(refs.filter((r) => r !== rec)).map((r) => ({ numero: r.numero, subitem: r.subitem || '', texto: r.texto })),
        ativo: def.modo !== 'evento',
        prazoInicial: null,
      };
      if (prazoRef && prazoRef.dias && p.recebimento && cat !== 'RENOVACAO') item.prazoInicial = { dias: prazoRef.dias, venceEm: addDaysIso(p.recebimento, prazoRef.dias) };
      itens.push(item);
    });
    const ordem = ['RENOVACAO', 'AVCB', 'INMETRO', 'ANP', 'LAUDO', 'TOG', 'TREINAMENTO', 'PGRS', 'PLACA', 'PUBLICACAO'];
    itens.sort((a, b) => ordem.indexOf(a.cat) - ordem.indexOf(b.cat));
    return itens;
  }

  const api = { parse, buildItens, uid, CATS, addMonthsIso, addDaysIso, brToIso };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LicParser = api;
})(typeof window !== 'undefined' ? window : globalThis);
