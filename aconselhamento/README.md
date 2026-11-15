# Aconselhamento · CCVideira

Página estática (`index.html` + `pincel.jpg`) que grava os cadastros num banco Supabase (Postgres).

## Como publicar
1. Crie um projeto grátis em supabase.com (região São Paulo).
2. **SQL Editor**: cole e rode `supabase/schema.sql`. Ele cria a tabela `cadastros` com validações e deixa o site apenas **inserir**.
3. **Project Settings → API**: copie a *Project URL* e a chave **anon public** para `SUPABASE_URL` e `SUPABASE_ANON_KEY` no `index.html`. Nunca use a `service_role`.
4. Hospede `index.html` e `pincel.jpg` juntos (Netlify, GitHub Pages ou site da igreja).
5. Envie um cadastro de teste e veja a linha em **Table Editor → cadastros**.

A equipe acompanha os pedidos no Table Editor (filtre por campus, mude o `status`). Convide só quem atende em Organization → Team.
Notificação por e-mail: Database → Webhooks, ou Database → Triggers + Edge Function (opcional).

Sem configuração, o envio falha de propósito e oferece o WhatsApp; a página nunca mostra "recebido" sem ter gravado.

## LGPD
- Dados sensíveis (luto, vícios, saúde emocional): acesso só à equipe; use autenticação em dois fatores no Supabase.
- Defina prazo de exclusão de cadastros antigos e coloque o link da Política de Privacidade junto ao consentimento.

## Painel da equipe (`painel.html`)
Página com login que mostra só os cadastros (e permite mudar o `status`). Quem entra não vê chaves nem configurações do Supabase.
1. SQL Editor: rode `supabase/painel.sql`, depois `insert into public.equipe(email) values ('pessoa@exemplo.com');` (e-mail em minúsculas).
2. **Authentication → Users → Add user → Create new user**: e-mail da pessoa, uma senha forte e **Auto Confirm User** marcado.
3. **Authentication → Sign In / Providers**: desligue **Allow new users to sign up**.
4. Publique `painel.html` junto com `index.html` (endereço: `seu-site.netlify.app/painel.html`) e passe o e-mail e a senha à pessoa por um canal seguro.
Para remover o acesso: apague o e-mail de `equipe` e o usuário em Authentication → Users.
