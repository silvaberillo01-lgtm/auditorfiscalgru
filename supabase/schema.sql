-- Schema do app de estudos — Auditor Fiscal VI (Guarulhos/IBAM)
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.

create extension if not exists "pgcrypto";

-- Temas canônicos (as 13 áreas do edital)
create table if not exists temas (
  id text primary key,              -- slug, ex: 'legislacao-tributaria-municipal'
  nome text not null,               -- 'Legislação Tributária Municipal'
  turno text not null,              -- 'Manhã' | 'Tarde'
  caderno text not null,            -- 'Básico' | 'Jurídico' | 'Tributário' | 'Fiscal'
  peso int not null,                -- 1 | 2 | 3
  n_questoes_prova int not null,    -- quantas questões esse tema tem na prova real
  ordem_sugerida int
);

-- Conteúdo de teoria (ENTENDER)
create table if not exists resumos (
  id uuid primary key default gen_random_uuid(),
  tema_id text references temas(id) on delete cascade,
  titulo text,
  conteudo_md text,
  pontos_decorar text[]
);

-- Banco de questões (TESTAR)
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

-- Flashcards (ESPAÇAR)
create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  tema_id text references temas(id) on delete cascade,
  pergunta text,
  resposta_html text
);

-- Progresso por tema — o coração da engine de fase
create table if not exists tema_progresso (
  tema_id text primary key references temas(id) on delete cascade,
  fase text not null default 'nao_iniciado',
  -- 'nao_iniciado' | 'entendendo' | 'testando' | 'corrigindo' | 'espacando' | 'dominado'
  entendido_em timestamptz,
  testado_em timestamptz,
  pct_acerto numeric,
  corrigido_em timestamptz
);

-- Fila de repetição espaçada — 1 linha por flashcard revisado
create table if not exists flashcard_reviews (
  flashcard_id uuid primary key references flashcards(id) on delete cascade,
  intervalo_dias int not null default 1,
  proxima_revisao date not null,
  ultima_revisao date,
  streak_acertos int default 0,
  ciclos_completos int default 0
);

-- Respostas do usuário (substitui o Excel do caderno atual)
create table if not exists respostas (
  id uuid primary key default gen_random_uuid(),
  questao_id uuid references questoes(id) on delete cascade,
  resposta text,
  correta boolean,
  raciocinio text,
  duvida text,
  respondida_em timestamptz default now()
);

-- Plano semanal (pra saber "o que é hoje")
create table if not exists plano_semanas (
  semana int primary key,
  periodo_inicio date,
  periodo_fim date,
  temas text[]
);

-- Log de atividade (pro streak tipo Duolingo)
create table if not exists atividade_diaria (
  data date primary key,
  minutos_estudo int default 0,
  acoes int default 0
);

create index if not exists idx_resumos_tema on resumos(tema_id);
create index if not exists idx_questoes_tema on questoes(tema_id);
create index if not exists idx_flashcards_tema on flashcards(tema_id);
create index if not exists idx_respostas_questao on respostas(questao_id);
create index if not exists idx_flashcard_reviews_proxima on flashcard_reviews(proxima_revisao);

-- App privado, single-user, acessado só pela URL do Vercel (sem auth multiusuário).
-- RLS fica desligado de propósito — se algum dia o projeto Supabase ficar exposto,
-- ligue RLS e crie policies antes de publicar a URL.
