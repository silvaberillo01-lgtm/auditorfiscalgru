# Estudos — Auditor Fiscal VI (Guarulhos/IBAM)

App de estudos para a prova de 13/09/2026. Unifica resumos, banco de
questões e flashcards numa engine de fase (entender → testar → corrigir →
espaçar) com dashboard diário, gamificação leve e PWA offline pra tela de
flashcards. Next.js + Supabase, login por link mágico (sem senha), uso
restrito a 2 pessoas (você + 1 convidado) via aprovação manual.

Este guia presume que você nunca configurou Supabase nem Vercel antes.

---

## 1. Criar o projeto Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) e clique em
   **New Project**.
2. Escolha um nome (ex: `estudos-af6`), uma senha de banco (guarde num
   gerenciador de senhas — só é usada internamente, você não vai digitá-la
   no dia a dia) e a região mais próxima (ex: São Paulo).
3. Aguarde o projeto provisionar (~2 min).
4. No menu lateral, vá em **SQL Editor** → **New query**, cole o conteúdo
   inteiro de `supabase/schema.sql` e clique em **Run**. Isso cria todas as
   tabelas, o trigger de criação automática de perfil, e as políticas de
   RLS (Row Level Security).
5. Em **Project Settings → API**, copie:
   - **Project URL** → vai virar `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → vai virar `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.1 Configurar o link mágico (magic link)

1. Em **Authentication → Providers**, confirme que **Email** está
   habilitado (vem habilitado por padrão) e que **"Confirm email"** /
   OTP por link está ativo — não precisa senha, só o link.
2. Em **Authentication → URL Configuration**:
   - **Site URL**: coloque a URL do seu app no Vercel (ex:
     `https://estudos-af6.vercel.app`) — você só vai saber essa URL depois
     do passo 6 (deploy), pode voltar aqui pra ajustar depois.
   - **Redirect URLs**: adicione `http://localhost:3000/auth/callback`
     (pra testar local) e `https://SEU-APP.vercel.app/auth/callback` (pra
     produção).
3. Não precisa configurar SMTP customizado — o Supabase envia os e-mails
   de link mágico automaticamente pelo provedor padrão dele (limite
   generoso o suficiente pra 2 usuários).

### 1.2 Como funciona a aprovação de usuários

- Ao clicar no link mágico pela primeira vez, um trigger no banco cria
  automaticamente uma linha em `perfis`.
- Se o e-mail for `silva.mateush01@gmail.com`, `aprovado` já entra como
  `true` (você é o admin, aprovado automaticamente).
- Qualquer outro e-mail entra com `aprovado = false` e vê a tela
  "Aguardando liberação" até você aprovar manualmente.
- **Para aprovar seu convidado**: vá em **Table Editor → perfis** no
  Supabase, encontre a linha com o e-mail dele, e mude `aprovado` para
  `true`. Não tem painel de aprovação no app — é direto na tabela mesmo,
  como combinado.

---

## 2. Configurar variáveis de ambiente (local)

```bash
cp .env.local.example .env.local
```

Preencha com os valores do passo 1.5:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

> A chave é pública por natureza (roda no navegador) — a segurança vem do
> RLS habilitado nas tabelas de progresso pessoal, não do segredo da
> chave.

---

## 3. Popular o conteúdo

```bash
npm install

# 13 temas canônicos do edital (confira peso/turno/caderno depois no Table Editor)
npx tsx scripts/seed-temas.ts

# conteúdo curado das 4 leis municipais + Português + RLM (lote 2)
npx tsx scripts/seed-lote2.ts
npx tsx scripts/seed-portugues-rlm.ts
```

### 3.1 Migrar os 3 artefatos antigos (opcional)

Coloque os arquivos originais em `data/legacy/` com **estes nomes
exatos**:

| Arquivo original | Nome esperado em `data/legacy/` | O que precisa expor |
|---|---|---|
| Caderno de questões | `estudo-ibam-guarulhos.jsx` | arrays `ORIGINAIS` e `VARIACOES` |
| Guia de resumos | `guia-estudos-ibam-guarulhos.jsx` | array `RESUMOS` |
| Flashcards HTML | `flashcards-trem.html` | array `CARDS` |

Depois rode:

```bash
npx tsx scripts/migrate.ts
```

O script remapeia a nomenclatura antiga pros 13 temas canônicos (seção 0
do spec) e corrige automaticamente qualquer flashcard de PAT que ainda
diga "30 dias" no recurso voluntário (o correto, pelo Decreto
21.066/2000 art. 34, é 20 dias). Questões antigas com o mesmo erro só
recebem um aviso no terminal — corrija manualmente pra não arriscar
quebrar o gabarito.

---

## 4. Rodar localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000), entre com seu e-mail
(link mágico chega na caixa de entrada) e comece a estudar. Seu e-mail
(`silva.mateush01@gmail.com`) é aprovado automaticamente.

---

## 5. Deploy no Vercel

1. Em [vercel.com/new](https://vercel.com/new), clique em **Import Git
   Repository** e selecione este repositório do GitHub.
2. Na tela de configuração do projeto, abra **Environment Variables** e
   adicione as duas mesmas variáveis do passo 2:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Clique em **Deploy**. Toda vez que você (ou o Claude Code) fizer push
   pra branch principal, o Vercel builda e publica automaticamente — não
   precisa fazer nada manual depois desse primeiro deploy.
4. Copie a URL gerada (ex: `https://estudos-af6.vercel.app`) e volte no
   Supabase (**Authentication → URL Configuration**, passo 1.1) pra
   confirmar que ela está em **Site URL** e em **Redirect URLs** como
   `https://estudos-af6.vercel.app/auth/callback`.
5. Compartilhe a URL com seu convidado — ele acessa, entra com o e-mail
   dele, e fica em "Aguardando liberação" até você aprovar na tabela
   `perfis`.

### 5.1 PWA offline (flashcards no trem)

No celular, abra a URL do Vercel, entre, visite `/revisar` pelo menos uma
vez com internet (isso guarda os flashcards do dia no cache do
navegador). Depois disso:
- **Android/Chrome**: menu → "Adicionar à tela inicial" instala como app.
- **iOS/Safari**: compartilhar → "Adicionar à Tela de Início".

Sem sinal, `/revisar` continua abrindo com os cards da última sincronização
e suas respostas (acertei/errei) ficam guardadas no aparelho, sincronizando
sozinhas assim que a internet voltar. Resumos e o caderno de questões
continuam exigindo conexão.

---

## Estrutura

- `supabase/schema.sql` — schema completo: tabelas de conteúdo (globais),
  tabelas de progresso pessoal (com RLS por `user_id`), tabela `perfis` e
  trigger de auto-criação/auto-aprovação do admin.
- `scripts/seed-temas.ts` — popula os 13 temas canônicos.
- `scripts/seed-lote2.ts` — resumos/flashcards/questões do CTM 7.966/2021,
  Decreto 21.066/2000 (PAT), Lei 5.767/2001 (Taxas ILF/Publicidade) e
  Lei 7.345/2014 (COSIP).
- `scripts/seed-portugues-rlm.ts` — resumo completo de Português e resumo
  curto (só fórmulas) de Raciocínio Lógico/Matemática Financeira, com mais
  questões de treino em RLM.
- `scripts/migrate.ts` — migra questões/resumos/flashcards dos 3 artefatos
  antigos.
- `src/lib/supabase/` — clientes Supabase: `server.ts` (Server
  Components/Actions, por requisição), `browser.ts` (Client Components,
  usado no login), `middleware.ts` (refresh de sessão no proxy).
- `src/proxy.ts` — protege todas as rotas exceto `/login` e
  `/auth/callback`, redirecionando não-autenticados pro login.
- `src/lib/auth.ts` — `requireAprovado()` / `requireAprovadoAction()`:
  bloqueiam acesso de quem não está aprovado.
- `src/lib/engine.ts` — engine de fase (`nao_iniciado → ... → dominado`) e
  repetição espaçada (Leitner simplificado: 1→3→7→15→30→60 dias).
- `src/app/page.tsx` — dashboard "hoje".
- `src/app/temas/` — listagem de temas, resumo, questões, correção.
- `src/app/revisar/` — fila de revisão de flashcards, com cache offline
  (`public/sw.js` + `src/lib/offline-queue.ts`).

## O que falta você preencher

- Números reais de `peso`/`n_questoes_prova`/`turno`/`caderno` por tema
  (edital) — hoje são placeholders em `scripts/seed-temas.ts`.
- Se ainda não rodou `scripts/migrate.ts`: os 3 artefatos antigos.
- `plano_semanas` — sem UI ainda; insira direto no Table Editor do
  Supabase (colunas: `semana`, `periodo_inicio`, `periodo_fim`, `temas`
  como array de ids).
- Ícones reais do PWA (`public/icon-192.png` / `public/icon-512.png`) —
  os atuais são placeholders sólidos, troque por algo com sua cara se
  quiser instalar o app com um ícone bonito.
