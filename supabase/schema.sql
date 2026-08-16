-- Schema do app de estudos — Auditor Fiscal VI (Guarulhos/IBAM)
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.
-- Idempotente: pode rodar de novo sem quebrar (usa "if not exists" e
-- "create or replace" em todo lugar). Se você já rodou a versão anterior
-- (sem multiusuário), rode este arquivo de novo por cima — ele faz a
-- migração das tabelas de progresso pra chave composta com user_id.

create extension if not exists "pgcrypto";

-- Temas canônicos (as 13 áreas do edital) — conteúdo global, compartilhado
create table if not exists temas (
  id text primary key,              -- slug, ex: 'legislacao-tributaria-municipal'
  nome text not null,               -- 'Legislação Tributária Municipal'
  turno text not null,              -- 'Manhã' | 'Tarde'
  caderno text not null,            -- 'Básico' | 'Jurídico' | 'Tributário' | 'Fiscal'
  peso int not null,                -- 1 | 2 | 3
  n_questoes_prova int not null,    -- quantas questões esse tema tem na prova real
  ordem_sugerida int
);

-- Conteúdo de teoria (ENTENDER) — global
create table if not exists resumos (
  id uuid primary key default gen_random_uuid(),
  tema_id text references temas(id) on delete cascade,
  titulo text,
  conteudo_md text,
  pontos_decorar text[]
);

-- Banco de questões (TESTAR) — global
create table if not exists questoes (
  id uuid primary key default gen_random_uuid(),
  tema_id text references temas(id) on delete cascade,
  origem text,                      -- 'real' | 'variacao'
  enunciado text,
  alternativas jsonb,                -- [{letra:'A', texto:'...'}, ...]
  gabarito text,
  explicacao text,
  fonte text
);

-- Flashcards (ESPAÇAR) — global
create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  tema_id text references temas(id) on delete cascade,
  pergunta text,
  resposta_html text
);

-- Plano semanal (pra saber "o que é hoje") — global
create table if not exists plano_semanas (
  semana int primary key,
  periodo_inicio date,
  periodo_fim date,
  temas text[]
);

-- Simulados (provas avulsas pra treinar em condições de prova) — global.
-- O progresso fica em simulado_respostas, totalmente separado de `respostas`:
-- responder um simulado NÃO mexe na engine de fase nem nas estatísticas
-- do caderno de questões normal.
create table if not exists simulados (
  id text primary key,              -- slug, ex: 'simulado-1'
  titulo text not null,
  descricao text,
  ordem int
);

create table if not exists simulado_questoes (
  id uuid primary key default gen_random_uuid(),
  simulado_id text not null references simulados(id) on delete cascade,
  numero int not null,              -- posição da questão na prova (1..N)
  tema_id text references temas(id) on delete set null,
  origem text,                      -- 'real' | 'estilo' (inédita no estilo IBAM)
  enunciado text,
  alternativas jsonb,               -- [{letra:'A', texto:'...'}, ...]
  gabarito text,
  explicacao text,
  fonte text,
  unique (simulado_id, numero)
);

-- Respostas + anotações do simulado, por usuário (1 linha por questão;
-- pode trocar a resposta até conferir o gabarito)
create table if not exists simulado_respostas (
  user_id uuid not null references auth.users(id) on delete cascade,
  questao_id uuid not null references simulado_questoes(id) on delete cascade,
  resposta text,
  anotacao text,
  respondida_em timestamptz default now(),
  primary key (user_id, questao_id)
);

-- Perfis — criado automaticamente no primeiro login (trigger abaixo).
-- silva.mateush01@gmail.com é aprovado automaticamente (admin); qualquer
-- outro e-mail entra com aprovado=false até você liberar manualmente.
create table if not exists perfis (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  aprovado boolean not null default false,
  criado_em timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfis (user_id, email, aprovado)
  values (new.id, new.email, new.email = 'silva.mateush01@gmail.com')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tabelas de progresso por usuário (multiusuário: eu + 1 convidado) --------

-- Progresso por tema — o coração da engine de fase
create table if not exists tema_progresso (
  user_id uuid not null references auth.users(id) on delete cascade,
  tema_id text not null references temas(id) on delete cascade,
  fase text not null default 'nao_iniciado',
  -- 'nao_iniciado' | 'entendendo' | 'testando' | 'corrigindo' | 'espacando' | 'dominado'
  entendido_em timestamptz,
  testado_em timestamptz,
  pct_acerto numeric,
  corrigido_em timestamptz,
  primary key (user_id, tema_id)
);

-- Fila de repetição espaçada — 1 linha por (usuário, flashcard) revisado
create table if not exists flashcard_reviews (
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_id uuid not null references flashcards(id) on delete cascade,
  intervalo_dias int not null default 1,
  proxima_revisao date not null,
  ultima_revisao date,
  streak_acertos int default 0,
  ciclos_completos int default 0,
  primary key (user_id, flashcard_id)
);

-- Respostas do usuário (substitui o Excel do caderno atual)
create table if not exists respostas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  questao_id uuid references questoes(id) on delete cascade,
  resposta text,
  correta boolean,
  raciocinio text,
  duvida text,
  respondida_em timestamptz default now()
);

-- Log de atividade (pro streak tipo Duolingo)
create table if not exists atividade_diaria (
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  minutos_estudo int default 0,
  acoes int default 0,
  primary key (user_id, data)
);

-- Anotações livres do usuário, por tema e por dia (pra copiar pra uma IA depois)
create table if not exists anotacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tema_id text references temas(id) on delete cascade,
  data date not null default current_date,
  titulo text,
  conteudo_md text,
  criada_em timestamptz not null default now()
);

create index if not exists idx_resumos_tema on resumos(tema_id);
create index if not exists idx_questoes_tema on questoes(tema_id);
create index if not exists idx_flashcards_tema on flashcards(tema_id);
create index if not exists idx_respostas_questao on respostas(questao_id);
create index if not exists idx_respostas_user on respostas(user_id);
create index if not exists idx_flashcard_reviews_proxima on flashcard_reviews(proxima_revisao);
create index if not exists idx_flashcard_reviews_user on flashcard_reviews(user_id);
create index if not exists idx_tema_progresso_user on tema_progresso(user_id);
create index if not exists idx_atividade_diaria_user on atividade_diaria(user_id);
create index if not exists idx_anotacoes_user on anotacoes(user_id);
create index if not exists idx_anotacoes_tema on anotacoes(tema_id);
create index if not exists idx_anotacoes_data on anotacoes(data desc);
create index if not exists idx_simulado_questoes_simulado on simulado_questoes(simulado_id);
create index if not exists idx_simulado_respostas_user on simulado_respostas(user_id);

-- Row Level Security ---------------------------------------------------
-- Conteúdo (temas/resumos/questoes/flashcards/plano_semanas) é global,
-- compartilhado pelos dois usuários — RLS ligado, mas com leitura liberada
-- pra qualquer usuário autenticado (ninguém de fora do app acessa).
-- As tabelas de progresso pessoal têm RLS: cada um só vê e edita suas
-- próprias linhas. perfis: cada um só vê/edita o próprio perfil.

alter table temas enable row level security;
alter table resumos enable row level security;
alter table questoes enable row level security;
alter table flashcards enable row level security;
alter table plano_semanas enable row level security;

drop policy if exists "temas: leitura autenticada" on temas;
create policy "temas: leitura autenticada" on temas for select to authenticated using (true);

drop policy if exists "resumos: leitura autenticada" on resumos;
create policy "resumos: leitura autenticada" on resumos for select to authenticated using (true);

drop policy if exists "questoes: leitura autenticada" on questoes;
create policy "questoes: leitura autenticada" on questoes for select to authenticated using (true);

drop policy if exists "flashcards: leitura autenticada" on flashcards;
create policy "flashcards: leitura autenticada" on flashcards for select to authenticated using (true);

drop policy if exists "plano_semanas: leitura autenticada" on plano_semanas;
create policy "plano_semanas: leitura autenticada" on plano_semanas for select to authenticated using (true);

alter table simulados enable row level security;
alter table simulado_questoes enable row level security;

drop policy if exists "simulados: leitura autenticada" on simulados;
create policy "simulados: leitura autenticada" on simulados for select to authenticated using (true);

drop policy if exists "simulado_questoes: leitura autenticada" on simulado_questoes;
create policy "simulado_questoes: leitura autenticada" on simulado_questoes for select to authenticated using (true);

alter table perfis enable row level security;
alter table tema_progresso enable row level security;
alter table flashcard_reviews enable row level security;
alter table respostas enable row level security;
alter table atividade_diaria enable row level security;
alter table anotacoes enable row level security;

drop policy if exists "perfis: ver o próprio" on perfis;
create policy "perfis: ver o próprio" on perfis
  for select using (auth.uid() = user_id);

drop policy if exists "perfis: editar o próprio" on perfis;
create policy "perfis: editar o próprio" on perfis
  for update using (auth.uid() = user_id);

drop policy if exists "tema_progresso: crud próprio" on tema_progresso;
create policy "tema_progresso: crud próprio" on tema_progresso
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "flashcard_reviews: crud próprio" on flashcard_reviews;
create policy "flashcard_reviews: crud próprio" on flashcard_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "respostas: crud próprio" on respostas;
create policy "respostas: crud próprio" on respostas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "atividade_diaria: crud próprio" on atividade_diaria;
create policy "atividade_diaria: crud próprio" on atividade_diaria
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "anotacoes: crud próprio" on anotacoes;
create policy "anotacoes: crud próprio" on anotacoes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table simulado_respostas enable row level security;

drop policy if exists "simulado_respostas: crud próprio" on simulado_respostas;
create policy "simulado_respostas: crud próprio" on simulado_respostas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
