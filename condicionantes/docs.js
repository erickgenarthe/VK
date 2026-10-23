/* Documentos encontrados nas pastas das empresas (datas lidas dos próprios PDFs/imagens).
   data = data do documento/ensaio/emissão; validade = até quando vale (quando consta no documento ou na regra). */
window.DOCS_PASTAS = {
  // 01 — Posto Novo Horizonte (Lucrécia)
  '08641978000144': {
    AVCB: { data: '2026-01-27', validade: '2027-01-27', arq: 'AVCB_POSTO NOVO HORIZONTE COMBUSTIVEIS.pdf', obs: 'AVCB emitido em 27/01/2026' },
    INMETRO: { data: '2025-11-18', validade: '2026-11-18', arq: 'IMETRO 01–04_POSTO NOVO HORIZONTE', obs: 'Certificados de verificação de 18/11/2025 (aprovado); renovação anual' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP COMERCIAL NOVO HORIZONTE LTDA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-15', arq: 'TOG - NOVO HORIZONTE COMBUSTIVEIS LTDA.pdf', obs: 'Coleta em 15/06/2026' },
    IBAMA: { data: '2026-09-08', validade: '2026-12-08', arq: 'IBAMA - POSTO NOVO HORIZONTE 2026.pdf', obs: 'Certificado de Regularidade (CTF/APP) emitido em 08/09/2026' },
  },
  // 03 — Fernandes e Queiroz (Pau dos Ferros)
  '20783185000165': {
    AVCB: { data: '2026-07-01', validade: '2027-07-01', arq: 'AVCB_FERNANDES E QUEIROZ.pdf', obs: 'AVCB nº 69145 emitido em 01/07/2026' },
    INMETRO: { data: '2025-07-14', validade: '2026-07-14', arq: 'INMETRO 01–04_FERNANDES E QUEIROZ.jpeg', obs: 'Verificação de 14/07/2025 (aprovado); renovação anual' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP FERNANDES E QUEIROZ COMBUSTIVEIS LTDA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-16', arq: 'TOG - FERNANDES E QUEIROZ COMBUSTIVEIS LTDA.pdf', obs: 'Coleta em 16/06/2026' },
  },
  // 04 — Auto Posto Central Mineiro (Frutuoso Gomes)
  '34086384000129': {
    AVCB: { data: '2025-11-18', validade: '2026-11-18', arq: 'AVCB AUTO POSTO CENTRAL MINEIRO LTDA VALIDADE 18 11 2026.pdf', obs: 'AVCB nº 65529 emitido em 18/11/2025' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP AUTO POSTO CENTRAL MINEIRO LTDA (2).pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-16', arq: 'TOG AUTO POSTO CENTRAL MINEIRO LTDA.pdf', obs: 'Coleta em 16/06/2026' },
    LAUDO: { data: '2020-09-08', validade: '2025-09-08', arq: 'TESTE DE ESTANQUEIDADE_POSTO CENTRAL MINEIRO.pdf', obs: 'Teste de 08/09/2020 (laudo de 23/09/2020); 5 anos' },
    IBAMA: { data: '2026-08-18', validade: '2026-11-18', arq: 'IBAMA AUTO POSTO CENTRAL MINEIRO.pdf', obs: 'Certificado de Regularidade (CTF/APP) emitido em 18/08/2026' },
  },
  // 05 — Posto Tibau
  '13259674000157': {
    AVCB: { data: '2025-04-01', validade: '2026-04-01', arq: 'AVCB_POSTO TIBAU.pdf', obs: 'AVCB nº 60529 emitido em 01/04/2025' },
    INMETRO: { data: '2025-11-13', validade: '2026-11-13', arq: 'INMETRO 01_POSTO TIBAU.pdf', obs: 'Certificados de verificação de 13/11/2025 (aprovado); renovação anual' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP POSTO TIBAU COMERCIO DE COMBUSTIVEIS E LUBRIFICANTES LTDA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2024-05-15', arq: 'TOG_POSTO TIBAU.pdf', obs: 'Coleta em 15/05/2024 (laudo de 31/05/2024)' },
    LAUDO: { data: '2021-07-26', validade: '2026-07-26', arq: 'TESTE DE ESTANQUEIDADE_POSTO TIBAU.pdf', obs: 'Teste de 26/07/2021 (laudo de 09/08/2021); 5 anos' },
  },
  // 06 — Posto LN
  '05676120000127': {
    AVCB: { data: '2025-04-01', validade: '2026-04-01', arq: 'AVCB_POSTO LN.pdf', obs: 'AVCB emitido em 01/04/2025' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP POSTO LN LTDA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2023-11-30', arq: 'TOG_POSTO LN.pdf', obs: 'Coleta em 30/11/2023 (laudo de 12/01/2024)' },
    LAUDO: { data: '2017-06-22', validade: '2022-06-22', arq: 'TESTE DE ESTANQUEIDADE_POSTO LN.pdf', obs: 'Teste de 22/06/2017; 5 anos' },
  },
  // 07 — Posto Maisa (Mossoró)
  '13771358000160': {
    AVCB: { data: '2025-04-01', validade: '2026-04-01', arq: 'AVCB_POSTO MAISA.pdf', obs: 'AVCB emitido em 01/04/2025' },
    INMETRO: { data: '2020-11-25', validade: '2021-11-25', arq: 'ATESTADO_POSTO MAISA.pdf', obs: 'Notificação de verificação de 25/11/2020 (único documento da pasta); renovação anual' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP POSTO MAISA COMERCIO DE COMBUSTIVEIS E LUBRIFICANTES LTDA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-17', arq: 'TOG POSTO MAISA COMERCIO DE COMBUSTIVEIS E LUBRIFICANTES LTDA.pdf', obs: 'Coleta em 17/06/2026' },
    LAUDO: { data: '2019-09-17', validade: '2024-09-17', arq: 'TESTE DE ESTANQUEIDADE_POSTO MAISA.pdf', obs: 'Teste de 17/09/2019 (laudo de 20/09/2019); 5 anos' },
  },
  // 08 — Posto Amigos (Frutuoso Gomes)
  '10898135000170': {
    AVCB: { data: '2025-02-05', validade: '2026-02-05', arq: 'AVCB_POSTO AMIGOS.pdf', obs: 'AVCB emitido em 05/02/2025' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP POSTO AMIGOS LTDA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-16', arq: 'TOG POSTO AMIGOS LTDA.pdf', obs: 'Coleta em 16/06/2026' },
    TREINAMENTO: { data: '2019-07-13', arq: 'CERTIFICADO FRENTISTA_POSTO AMIGOS.pdf', obs: 'NR-20 Básico (1 funcionário), concluído em 13/07/2019' },
    IBAMA: { data: '2025-03-15', validade: '2025-06-15', arq: 'CERTIFICADO IBAMA_POSTO AMIGOS.pdf', obs: 'Certificado de Regularidade (CTF/APP) válido até 15/06/2025 — o último da pasta' },
  },
  // 10 — Posto Carioca (Pau dos Ferros)
  '11287738000106': {
    AVCB: { data: '2025-12-23', validade: '2026-12-23', arq: 'AVCB_POSTO CARIOCA.pdf', obs: 'AVCB emitido em 23/12/2025' },
    INMETRO: { data: '2025-07-15', validade: '2026-07-15', arq: 'INMETRO_POSTO CARIOCA.pdf', obs: 'Notificação/verificação de 15/07/2025 (aprovado); renovação anual' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP_POSTO CARIOCA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-16', arq: 'TOG POSTO CARIOCA LTDA.pdf', obs: 'Coleta em 16/06/2026' },
    LAUDO: { data: '2019-07-24', validade: '2024-07-24', arq: 'TESTE DE ESTANQUEIDADE_POSTO CARIOCA.pdf', obs: 'Laudo de 24/07/2019 (teste de jul/2019); 5 anos' },
  },
  // 11 — Posto Serrano (Francisco Valentim Gonçalves, São Miguel)
  '07951495000183': {
    INMETRO: { data: '2021-02-10', validade: '2022-02-10', arq: 'INMETRO_FRANCISCO VALENTIM.pdf', obs: 'Verificação de 10/02/2021 (aprovado) — o último da pasta; renovação anual' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP_FRANCISCO VALENTIM.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-17', arq: 'TOG FRANCISCO VALENTIM GONCALVES.pdf', obs: 'Coleta em 17/06/2026' },
  },
  // 12 — Posto Fufa Venha Ver (Damiana Maria de Jesus Dantas)
  '10973484000109': {
    AVCB: { data: '2025-07-22', validade: '2026-07-22', arq: 'AVCB_DAMIANA MARIA.pdf', obs: 'AVCB emitido em 22/07/2025' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP DAMIANA MARIA DE JESUS DANTAS VAREJISTA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-17', arq: 'TOG DAMIANA MARIA DE JESUS DANTAS VAREJISTA.pdf', obs: 'Coleta em 17/06/2026' },
    LAUDO: { data: '2022-03-30', validade: '2027-03-30', arq: 'TESTE DE ESTANQUEIDADE_DAMIANA MARIA.pdf', obs: 'Teste de 30/03/2022; 5 anos' },
  },
  // 13 — Posto Fufa Encanto (Fábio Maciel Dantas)
  '15479978000155': {
    AVCB: { data: '2025-10-28', validade: '2026-10-28', arq: 'AVCB_FABIO MACIEL DANTAS VAREJISTA.pdf', obs: 'AVCB nº 65104 emitido em 28/10/2025' },
    INMETRO: { data: '2020-10-09', validade: '2021-10-09', arq: 'IMETRO01–09_FABIO MACIEL DANTAS VAREJUISTA.pdf', obs: 'Verificação de 09/10/2020 (aprovado) — a última da pasta; renovação anual' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP FABIO MACIEL DANTAS VAREJISTA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-17', arq: 'TOG (15.479.978 0001-55 FABIO MACIEL DANTAS VAREJISTA).pdf', obs: 'Coleta em 17/06/2026' },
  },
  // 14 — Nosso Posto Encanto (Estevam e Castro)
  '06287722000155': {
    AVCB: { data: '2025-08-05', validade: '2026-08-05', arq: 'AVCB_ESTEVAM E CASTRO.pdf', obs: 'AVCB emitido em 05/08/2025' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP ESTEVAM E CASTRO POSTO DE COMBUSTIVEL LTDA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-17', arq: 'TOG (06.287.722 0001-55 ESTEVAM E CASTRO).pdf', obs: 'Coleta em 17/06/2026' },
    TCFA: { data: '2024-01-29', validade: '2024-01-31', arq: 'BOLETOS IBAMA EM ABERTO (6 boletos)', obs: '6 boletos TCFA em aberto na pasta: 2022/3 a 2023/4, todos com vencimento em 31/01/2024' },
  },
  // 18 — Posto Central São Sebastião (Coronel João Pessoa)
  '12203201000175': {
    AVCB: { data: '2024-08-22', validade: '2025-08-22', arq: 'AVCB_POSTO CENTRAL SAO SEBASTIAO LTDA.pdf', obs: 'AVCB emitido em 22/08/2024' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP POSTO CENTRAL SAO SEBASTIAO LTDA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-17', arq: '12.203.201 0001-75 POSTO CENTRAL SAO SEBASTIAO LTDA.pdf', obs: 'Coleta em 17/06/2026' },
    LAUDO: { data: '2022-08-25', validade: '2027-08-25', arq: 'TESTE DE ESTANQUEIDADE_POSTO CENTRAL SAO SEBASTIAO LTDA.pdf', obs: 'Ensaio de 25/08/2022; 5 anos' },
    IBAMA: { data: '2026-07-24', validade: '2026-10-24', arq: 'IBAMA POSTO CENTRAL SÃO SEBASTIÃO.pdf', obs: 'Certificado de Regularidade (CTF/APP) emitido em 24/07/2026' },
  },
  // 19 — Posto Elgiano / Posto Gomes (Gomes Comércio de Combustíveis)
  '40973051000114': {
    AVCB: { data: '2025-05-21', validade: '2026-05-21', arq: 'AVCB_POSTO GOMES.pdf', obs: 'AVCB emitido em 21/05/2025' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP POSTO GOMES.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-16', arq: '40.973.051 0001-14 GOMES COMERCIO DE COMBUSTIVEIS LTDA.pdf', obs: 'Coleta em 16/06/2026' },
  },
  // 20 — Auto Posto Pais e Filhos (licença do IDEMA não está na pasta)
  '15479953000151': {
    AVCB: { data: '2025-04-24', validade: '2026-04-24', arq: 'AVCB_AUTO POSTO PAIS & FILHOS.pdf', obs: 'AVCB nº 61155 emitido em 24/04/2025' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP AUTO POSTO PAIS&FILHOS LTDA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-17', arq: '15.479.953 0001-51 AUTO POSTO PAIS FILHOS LTDA.pdf', obs: 'Coleta em 17/06/2026' },
  },
  // 21 — Auto Posto Maioridade (Martins)
  '23475547000149': {
    AVCB: { data: '2025-10-14', validade: '2026-10-14', arq: 'AVCB_ POSTO MAIORIDADE.pdf', obs: 'AVCB nº 65330 emitido em 14/10/2025' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP AUTO POSTO MAIORIDADE.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-16', arq: '23.475.547 0001-49 AUTO POSTO MAIORIDADE LTDA.pdf', obs: 'Coleta em 16/06/2026' },
  },
  // 22 — Marcos Antonio Gurgel Costa (Posto Imperatriz, Martins)
  '01119969000149': {
    AVCB: { data: '2025-10-14', validade: '2026-10-14', arq: 'AVCB_POSTO IMPERATRIZ.pdf', obs: 'AVCB emitido em 14/10/2025' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP MARCOS ANTONIO GURGEL COSTA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-16', arq: '01.119.969 0001-49 MARCOS ANTONIO GURGEL COSTA.pdf', obs: 'Coleta em 16/06/2026' },
    IBAMA: { data: '2026-06-07', validade: '2026-09-07', arq: 'LICENÇA IBAMA.pdf', obs: 'Certificado de Regularidade (CTF/APP) emitido em 07/06/2026' },
  },
  // 16 — E D A de Sousa (Auto Posto Taboleiro)
  '51502654000154': {
    AVCB: { data: '2025-05-08', validade: '2026-05-08', arq: 'AVCB_E D A DE SOUSA.pdf', obs: 'AVCB emitido em 08/05/2025' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP E D A DE SOUSA COMBUSTIVEIS LTDA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-17', arq: '51.502.654 0001-54 AUTO POSTO TABOLEIRO LTDA.pdf', obs: 'Coleta em 17/06/2026' },
    LAUDO: { data: '2021-01-20', validade: '2026-01-20', arq: 'Teste de Estanqueidade_E D A DE SOUSA COMBUSTIVEIS LTDA.pdf', obs: 'Ensaio de 20/01/2021; 5 anos' },
  },
  // 17 — Fernandes e Pinheiro (Venha-Ver)
  '23761095000161': {
    INMETRO: { data: '2025-11-11', validade: '2026-11-11', arq: 'INMETRO_FERNANDES E PINHEIRO LTDA.pdf', obs: 'Verificação de 11/11/2025 (aprovado); renovação anual' },
    ANP: { data: '2026-09-08', validade: '2026-12-08', arq: 'ANP_FERNANDES E PINHEIRO LTDA.pdf', obs: 'Certificado emitido em 08/09/2026, válido por 3 meses' },
    TOG: { data: '2026-06-17', arq: '23.761.095 0001-61 FERNANDES E PINHEIRO LTDA.pdf', obs: 'Coleta em 17/06/2026' },
    IBAMA: { data: '2026-06-08', validade: '2026-09-08', arq: 'IBAMA.pdf', obs: 'Certificado de Regularidade (CTF/APP) emitido em 08/06/2026' },
  },
  // Posto da Serra (documentos enviados avulsos)
  '29120373000188': {
    AVCB: { data: '2022-09-23', validade: '2023-09-23', arq: 'AVCB_2023.pdf', obs: 'AVCB nº 41852 emitido em 23/09/2022' },
    TREINAMENTO: { data: '2023-01-28', arq: 'Certificados NR-20 Básico (2 funcionários)', obs: 'NR-20 Básico concluído em 28/01/2023' },
  },
};
/* Protocolos reais no Comunic@ do Posto da Serra (mensagens enviadas pelo usuário). */
window.ENVIOS_SERRA = [
  { data: '2021-10-11', mensagem: '1YI4E-6', cats: ['AVCB', 'LAUDO', 'PLACA'] },
  { data: '2022-11-30', mensagem: '2CEJZ-1', cats: ['TOG'] },
  { data: '2023-09-02', mensagem: '2M7Y9-4', cats: ['TOG'] },
];
