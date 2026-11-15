-- Painel da equipe: rode no Supabase (SQL Editor > New query > Run) DEPOIS do schema.sql

-- 1) Lista de e-mails autorizados a ver os cadastros
create table if not exists public.equipe (
  email text primary key check (email = lower(email))
);
alter table public.equipe enable row level security;
revoke all on public.equipe from anon, authenticated;

-- 2) Função que diz se quem está logado é da equipe
create or replace function public.is_equipe() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.equipe where email = lower(auth.jwt() ->> 'email'))
$$;
revoke all on function public.is_equipe() from public, anon;
grant execute on function public.is_equipe() to authenticated;

-- 3) A equipe pode LER os cadastros e mudar só a coluna "status"
drop policy if exists "equipe le" on public.cadastros;
create policy "equipe le" on public.cadastros
  for select to authenticated using (public.is_equipe());
drop policy if exists "equipe atualiza status" on public.cadastros;
create policy "equipe atualiza status" on public.cadastros
  for update to authenticated using (public.is_equipe()) with check (public.is_equipe());
grant select on public.cadastros to authenticated;
grant update (status) on public.cadastros to authenticated;

-- 4) Autorize a pessoa (troque pelo e-mail real, em minúsculas):
-- insert into public.equipe(email) values ('pessoa@exemplo.com');
