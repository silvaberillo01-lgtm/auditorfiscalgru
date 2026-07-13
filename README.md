# Estudos — Auditor Fiscal VI (Guarulhos/IBAM)

App pessoal de estudos para a prova de 13/09/2026. Unifica resumos, banco de
questões e flashcards numa engine de fase (entender → testar → corrigir →
espaçar) com dashboard diário. Next.js + Supabase, uso single-user sem login
(app privado, acessado só pela URL do Vercel).

## 1. Criar o projeto Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, cole e rode o conteúdo de `supabase/schema.sql` inteiro.
3. Em **Project Settings → API**, copie a `Project URL` e a chave `anon public`.

## 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os
valores do passo anterior.

> RLS fica desligado de propósito (app privado, single-user). Se um dia expuser
> a chave anon publicamente além da URL do Vercel, ligue RLS e crie policies.

## 3. Popular os 13 temas do edital

```bash
npm install
npx tsx scripts/seed-temas.ts
```

Os valores de `peso` e `n_questoes_prova` em `scripts/seed-temas.ts` são
placeholders — confira no edital real e ajuste (dá pra editar depois direto
no Table Editor do Supabase também).

## 4. Migrar conteúdo dos 3 artefatos antigos (opcional)

Coloque os arquivos originais em `data/legacy/` (veja
`data/legacy/README.md` para os nomes esperados) e rode:

```bash
npx tsx scripts/migrate.ts
```

O script remapeia a nomenclatura de flashcards/resumos para os 13 temas
canônicos (seção 0 do spec) e avisa no terminal quando não conseguir mapear
um item com confiança — revise esses casos manualmente depois.

## 5. Rodar localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## 6. Deploy no Vercel

1. Suba este repositório no GitHub (já feito, se você está lendo isso pelo
   PR do Claude Code).
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Configure as mesmas env vars do passo 2 (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) nas configurações do projeto Vercel.
4. Deploy. A URL gerada é a "senha" do app — não precisa de login porque só
   você vai saber a URL.

## Estrutura

- `supabase/schema.sql` — schema completo (tabelas da seção 1 do spec).
- `scripts/seed-temas.ts` — popula os 13 temas canônicos.
- `scripts/migrate.ts` — migra questões/resumos/flashcards antigos.
- `src/lib/engine.ts` — engine de fase (transições `nao_iniciado → ... → dominado`)
  e repetição espaçada (Leitner simplificado: 1→3→7→15→30→60 dias).
- `src/app/page.tsx` — dashboard "hoje" (revisões atrasadas, tema da semana, streak).
- `src/app/temas/` — listagem de temas, resumo, questões, correção de erros.
- `src/app/revisar/` — fila de revisão de flashcards do dia.

## O que falta você preencher

- Números reais de `peso`/`n_questoes_prova`/`turno`/`caderno` por tema (edital).
- `plano_semanas` — ainda não tem UI para cadastrar; insira direto no Supabase
  Table Editor por enquanto (colunas: `semana`, `periodo_inicio`, `periodo_fim`,
  `temas` como array de ids).
- Conteúdo de CTM 7.966, COSIP 7.345, Taxas 5.767, Decreto 21.066 (resumos/questões/flashcards).
- PWA offline para o trem (fase 6 do roadmap, opcional — fora do escopo desta entrega).
