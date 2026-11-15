# Aconselhamento · CCVideira

Página estática (`index.html` + `pincel.jpg`) que grava os cadastros numa planilha Google.

## Como publicar
1. Crie uma planilha Google (restrita à equipe de aconselhamento). Em **Extensões → Apps Script**, cole `apps-script/Code.gs`.
2. **Implantar → Nova implantação → App da Web**. Executar como: *eu*. Quem tem acesso: *Qualquer pessoa*. Copie a URL que termina em `/exec`.
3. No `index.html`, cole essa URL em `const ENDPOINT = "..."`.
4. Hospede `index.html` e `pincel.jpg` juntos (Netlify, GitHub Pages ou o site da igreja).
5. **Teste:** envie um cadastro e confira se a linha aparece na aba *Cadastros*.

Sem `ENDPOINT` o envio falha de propósito e oferece o WhatsApp como alternativa; a página nunca mostra "recebido" sem ter gravado.

## Cuidados (dados sensíveis, LGPD)
- Compartilhe a planilha só com quem atende. Evite links "qualquer pessoa com o link".
- Defina quem apaga cadastros antigos e quando.
- Se tiver Política de Privacidade, coloque o link junto ao texto de consentimento.
