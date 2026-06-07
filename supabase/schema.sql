-- jogadores
create table jogadores (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  sobrenome  text not null,
  telefone   text not null,
  criado_em  timestamptz default now()
);

-- pontuacoes
create table pontuacoes (
  id          uuid primary key default gen_random_uuid(),
  jogador_id  uuid references jogadores(id) not null,
  score       integer not null,
  personagem  smallint not null check (personagem in (1, 2)),
  criado_em   timestamptz default now()
);

-- RLS — allow anonymous read/write (game uses anon key)
alter table jogadores  enable row level security;
alter table pontuacoes enable row level security;

create policy "anon_insert_jogadores" on jogadores  for insert with check (true);
create policy "anon_read_jogadores"   on jogadores  for select using (true);
create policy "anon_insert_scores"    on pontuacoes for insert with check (true);
create policy "anon_read_scores"      on pontuacoes for select using (true);
