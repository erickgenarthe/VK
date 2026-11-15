/**
 * Recebe os cadastros do formulário e grava na planilha.
 * Veja o README.md para publicar como Web App.
 */
const NOTIFICAR_EMAIL = ''; // opcional: e-mail da equipe para aviso de novo cadastro
const COLUNAS = ['Campus','Nome','WhatsApp','E-mail','Idade','Estado civil','Vínculo','GC','Líder',
  'Tipo','Área','Motivo','Modalidade','Período','Já fez antes'];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (!d.Nome || !d.WhatsApp || !d.Campus) throw new Error('dados incompletos');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName('Cadastros');
    if (!sh) {
      sh = ss.insertSheet('Cadastros');
      sh.appendRow(['Data/hora'].concat(COLUNAS, ['Status']));
      sh.setFrozenRows(1);
    }
    const limpa = v => { v = String(v == null ? '' : v).slice(0, 2000); return /^[=+\-@]/.test(v) ? "'" + v : v; }; // evita fórmulas
    sh.appendRow([new Date()].concat(COLUNAS.map(c => limpa(d[c])), ['Novo']));
    lock.releaseLock();
    if (NOTIFICAR_EMAIL) MailApp.sendEmail(NOTIFICAR_EMAIL, 'Novo cadastro de aconselhamento', 'Há um novo cadastro na planilha (' + d.Campus + ').');
    return resp({ ok: true });
  } catch (err) {
    return resp({ ok: false, erro: String(err.message || err) });
  }
}

function resp(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
