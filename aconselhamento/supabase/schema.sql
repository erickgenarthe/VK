-- Rode no Supabase: SQL Editor > New query > Run
create table public.cadastros (
  id            bigint generated always as identity primary key,
  criado_em     timestamptz not null default now(),
  status        text not null default 'novo' check (status in ('novo','em contato','agendado','concluído')),
  campus        text not null check (campus in ('CCVideira Capim Macio','CCVideira Candelária')),
  nome          text not null check (char_length(nome) between 2 and 120),
  whatsapp      text not null check (char_length(whatsapp) between 10 and 20),
  email         text check (char_length(email) <= 160),
  idade         int  check (idade between 1 and 120),
  estado_civil  text check (char_length(estado_civil) <= 40),
  vinculo       text not null check (vinculo in ('Membro','Frequentador','Visitante')),
  gc            text check (char_length(gc) <= 120),
  lider_gc      text check (char_length(lider_gc) <= 120),
  tipo          text not null check (tipo in ('Individual','Casal','Família','Pré-nupcial')),
  areas         text check (char_length(areas) <= 300),
  motivo        text check (char_length(motivo) <= 2000),
  modalidade    text not null check (modalidade in ('Presencial','Online')),
  periodos      text check (char_length(periodos) <= 80),
  ja_fez_antes  text check (ja_fez_antes in ('Sim','Não'))
);

alter table public.cadastros enable row level security;

-- O site (chave anon) só pode INSERIR. Ninguém lê, edita ou apaga pelo site.
create policy "site pode inserir" on public.cadastros
  for insert to anon with check (status = 'novo');

revoke all on public.cadastros from anon, authenticated;
grant insert on public.cadastros to anon;
