/**
 * Migra os 3 artefatos antigos (caderno de questões, guia de resumos,
 * flashcards HTML) para o Supabase, remapeando tudo para os 13 temas
 * canônicos (seção 0 e 5 do spec).
 *
 * Escrito contra a estrutura real dos seus 3 arquivos (conferida campo a
 * campo, não adivinhada):
 *   - estudo-ibam-guarulhos.jsx: ORIGINAIS/VARIACOES com campos
 *     {id, m (matéria = nome canônico do tema), f (fonte), e (enunciado),
 *     alt (array de strings das alternativas), g (índice 0-based da
 *     correta), c (comentário/explicação)}.
 *   - guia-estudos-ibam-guarulhos.jsx: RESUMOS com
 *     {id, titulo, secoes: [{h, p}], memorizar: string[]} — os `m` das
 *     questões batem 1:1 com os 13 temas canônicos; já os `secoes` dos
 *     resumos, em 4 dos 8 blocos, misturam 2 temas e precisam de split
 *     por cabeçalho (mapa RESUMO_SPLIT abaixo).
 *   - flashcards-trem.html: CARDS com {m (matéria antiga, 9 categorias),
 *     p (peso — NÃO é pergunta, cuidado), q (pergunta), a (resposta)}.
 *
 * Pré-requisito: rode `scripts/seed-temas.ts` antes (os temas precisam
 * existir por causa da foreign key).
 *
 * Uso: npx tsx scripts/migrate.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local");
  process.exit(1);
}
const supabase = createClient(url, key);

const LEGACY_DIR = join(process.cwd(), "data", "legacy");
const LETRAS = ["A", "B", "C", "D", "E", "F"];

/** Extrai `const NOME = [ ... ];` de um arquivo texto e avalia como JS puro. */
function extrairArray(fonte: string, nomeVar: string): unknown[] | null {
  const regex = new RegExp(`(?:const|let|var)\\s+${nomeVar}\\s*=\\s*(\\[[\\s\\S]*?\\n\\]);`, "m");
  const match = fonte.match(regex);
  if (!match) return null;
  try {
    // Arquivo é seu próprio material local e confiável — eval controlado só nesse script offline.
    return new Function(`"use strict"; return (${match[1]});`)();
  } catch (e) {
    console.warn(`Falha ao avaliar array ${nomeVar}:`, e);
    return null;
  }
}

/** Nome canônico (como aparece em `m` nas questões) -> slug do tema. */
const NOME_PARA_SLUG: Record<string, string> = {
  "Língua Portuguesa": "lingua-portuguesa",
  "Raciocínio Lógico e Matemática Financeira": "raciocinio-logico-mat-financeira",
  "TI, Análise de Dados e LGPD": "ti-analise-dados-lgpd",
  "Direito Administrativo": "direito-administrativo",
  "Direito Constitucional": "direito-constitucional",
  "Direito Tributário": "direito-tributario",
  "Direito Empresarial, Penal e Civil": "direito-empresarial-penal-civil",
  "Legislação Tributária Municipal": "legislacao-tributaria-municipal",
  "Tributos Municipais": "tributos-municipais",
  "Reforma Tributária": "reforma-tributaria",
  "Contabilidade Fiscal": "contabilidade-fiscal",
  "Auditoria Fiscal": "auditoria-fiscal",
  "Processo Administrativo Tributário": "processo-administrativo-tributario",
};

// ---------------------------------------------------------------------------
// QUESTÕES
// ---------------------------------------------------------------------------

type QuestaoLegado = {
  id?: string;
  m: string; // matéria — bate 1:1 com os 13 temas canônicos
  f?: string; // fonte
  e: string; // enunciado
  alt: string[]; // alternativas, texto puro, na ordem A,B,C...
  g: number; // índice 0-based da alternativa correta
  c?: string; // comentário/explicação
};

async function migrarQuestoes() {
  const caminho = join(LEGACY_DIR, "estudo-ibam-guarulhos.jsx");
  if (!existsSync(caminho)) {
    console.log("(pulando questões: data/legacy/estudo-ibam-guarulhos.jsx não encontrado)");
    return;
  }
  const fonte = readFileSync(caminho, "utf-8");
  const originais = (extrairArray(fonte, "ORIGINAIS") ?? []) as QuestaoLegado[];
  const variacoes = (extrairArray(fonte, "VARIACOES") ?? []) as QuestaoLegado[];

  const linhas: {
    tema_id: string;
    origem: string;
    enunciado: string;
    alternativas: { letra: string; texto: string }[];
    gabarito: string;
    explicacao: string | undefined;
    fonte: string | undefined;
  }[] = [];

  for (const [origem, lista] of [["real", originais], ["variacao", variacoes]] as const) {
    for (const q of lista) {
      const tema_id = NOME_PARA_SLUG[q.m];
      if (!tema_id) {
        console.warn(`  aviso: questão com matéria não reconhecida "${q.m}" (id ${q.id}) — pulando`);
        continue;
      }
      const alternativas = (q.alt ?? []).map((texto, i) => ({ letra: LETRAS[i], texto }));
      linhas.push({
        tema_id,
        origem,
        enunciado: q.e,
        alternativas,
        gabarito: LETRAS[q.g],
        explicacao: q.c,
        fonte: q.f,
      });
    }
  }

  if (linhas.length === 0) {
    console.log("Nenhuma questão encontrada em ORIGINAIS/VARIACOES.");
    return;
  }

  // Correção conhecida: questões antigas de PAT que citam "30 dias" pro
  // recurso voluntário estão desatualizadas — o Decreto 21.066/2000 art. 34
  // diz 20 dias. Só avisa (não reescreve alternativas automaticamente,
  // porque pode quebrar o índice do gabarito) — revise manualmente.
  for (const q of linhas) {
    const textoCompleto = JSON.stringify(q);
    if (
      q.tema_id === "processo-administrativo-tributario" &&
      /recurso volunt[áa]rio/i.test(textoCompleto) &&
      /30\s*dias/i.test(textoCompleto)
    ) {
      console.warn(
        `  aviso: questão de PAT menciona "30 dias" pro recurso voluntário — confira manualmente, o correto é 20 dias (Decreto 21.066/2000, art. 34): "${q.enunciado.slice(0, 80)}..."`
      );
    }
  }

  const { error } = await supabase.from("questoes").insert(linhas);
  if (error) console.error("Erro ao inserir questões:", error.message);
  else console.log(`OK: ${linhas.length} questões migradas.`);
}

// ---------------------------------------------------------------------------
// RESUMOS
// ---------------------------------------------------------------------------

type Secao = { h: string; p: string };
type ResumoLegado = {
  id: string;
  titulo: string;
  intro?: string;
  secoes: Secao[];
  memorizar?: string[];
};

/**
 * 4 dos 8 blocos do guia antigo misturam 2 temas canônicos no mesmo
 * bloco. Este mapa decide, por palavra-chave no cabeçalho (`h`) de cada
 * seção, pra qual tema ela vai. Os 4 blocos que não aparecem aqui
 * (`trib`, `muni1`, `reforma`) mapeiam inteiros pra 1 tema só (ver
 * RESUMO_TEMA_UNICO).
 */
const RESUMO_SPLIT: Record<string, { palavraChave: RegExp; tema: string }[]> = {
  muni2: [
    { palavraChave: /^ITBI/i, tema: "legislacao-tributaria-municipal" },
    { palavraChave: /^PAT/i, tema: "processo-administrativo-tributario" },
  ],
  contab: [
    { palavraChave: /auditoria|opinião do auditor|independência/i, tema: "auditoria-fiscal" },
    { palavraChave: /.*/, tema: "contabilidade-fiscal" }, // default do bloco
  ],
  "adm-const": [
    { palavraChave: /constitucional/i, tema: "direito-constitucional" },
    { palavraChave: /.*/, tema: "direito-administrativo" }, // default do bloco
  ],
  "emp-pen-por": [
    { palavraChave: /português/i, tema: "lingua-portuguesa" },
    { palavraChave: /.*/, tema: "direito-empresarial-penal-civil" }, // default do bloco
  ],
  "ti-rlm": [
    { palavraChave: /raciocínio lógico|raciocinio logico/i, tema: "raciocinio-logico-mat-financeira" },
    { palavraChave: /.*/, tema: "ti-analise-dados-lgpd" }, // default do bloco
  ],
};

const RESUMO_TEMA_UNICO: Record<string, string> = {
  trib: "direito-tributario",
  muni1: "legislacao-tributaria-municipal",
  reforma: "reforma-tributaria",
};

function secaoParaMarkdown(s: Secao) {
  return `### ${s.h}\n\n${s.p}`;
}

async function migrarResumos() {
  const caminho = join(LEGACY_DIR, "guia-estudos-ibam-guarulhos.jsx");
  if (!existsSync(caminho)) {
    console.log("(pulando resumos: data/legacy/guia-estudos-ibam-guarulhos.jsx não encontrado)");
    return;
  }
  const fonte = readFileSync(caminho, "utf-8");
  const resumos = (extrairArray(fonte, "RESUMOS") ?? []) as ResumoLegado[];

  if (resumos.length === 0) {
    console.log("Nenhum resumo encontrado em RESUMOS.");
    return;
  }

  // agrupa seções por tema_id de destino, dentro de cada bloco original
  const porTema = new Map<string, { titulo: string; secoes: Secao[]; memorizar: string[] }>();

  for (const bloco of resumos) {
    const temaUnico = RESUMO_TEMA_UNICO[bloco.id];
    const regras = RESUMO_SPLIT[bloco.id];

    if (temaUnico) {
      const atual = porTema.get(temaUnico) ?? { titulo: bloco.titulo, secoes: [], memorizar: [] };
      atual.secoes.push(...bloco.secoes);
      atual.memorizar.push(...(bloco.memorizar ?? []));
      porTema.set(temaUnico, atual);
      continue;
    }

    if (!regras) {
      console.warn(`  aviso: bloco de resumo "${bloco.id}" sem regra de mapeamento — pulando`);
      continue;
    }

    for (const secao of bloco.secoes) {
      const regra = regras.find((r) => r.palavraChave.test(secao.h));
      const temaId = regra?.tema ?? regras[regras.length - 1].tema;
      const atual = porTema.get(temaId) ?? { titulo: bloco.titulo, secoes: [], memorizar: [] };
      atual.secoes.push(secao);
      porTema.set(temaId, atual);
    }
    // o array `memorizar` do bloco não é claramente atribuível a uma seção
    // específica — duplica pros temas derivados desse bloco (melhor
    // duplicar do que perder o ponto de decorar).
    const temasDoBloco = new Set(
      bloco.secoes.map((s) => regras.find((r) => r.palavraChave.test(s.h))?.tema ?? regras[regras.length - 1].tema)
    );
    for (const temaId of temasDoBloco) {
      const atual = porTema.get(temaId)!;
      atual.memorizar.push(...(bloco.memorizar ?? []));
    }
  }

  const linhas = [...porTema.entries()].map(([tema_id, dados]) => ({
    tema_id,
    titulo: dados.titulo,
    conteudo_md: dados.secoes.map(secaoParaMarkdown).join("\n\n"),
    pontos_decorar: [...new Set(dados.memorizar)],
  }));

  const { error } = await supabase.from("resumos").insert(linhas);
  if (error) console.error("Erro ao inserir resumos:", error.message);
  else console.log(`OK: ${linhas.length} resumos migrados (de ${resumos.length} blocos originais).`);
}

// ---------------------------------------------------------------------------
// FLASHCARDS
// ---------------------------------------------------------------------------

type CardLegado = { m: string; p: number; q: string; a: string };

/**
 * Remapeia as 9 categorias antigas de flashcard pros 13 temas canônicos
 * (seção 0 do spec). "Legislação Municipal" e "Contabilidade/Auditoria"
 * e "LGPD/TI/RLM" precisam de split por palavra-chave no conteúdo do
 * card; os demais mapeiam direto.
 */
function remapTema(nomeAntigo: string, textoItem: string): string[] {
  const t = textoItem.toLowerCase();

  switch (nomeAntigo) {
    case "Direito Tributário":
      return ["direito-tributario"];
    case "Reforma Tributária":
      return ["reforma-tributaria"];
    case "PAT (Processo Adm.)":
      return ["processo-administrativo-tributario"];
    case "Direito Administrativo":
      return ["direito-administrativo"];
    case "Direito Constitucional":
      return ["direito-constitucional"];
    case "Penal/Empresarial":
      return ["direito-empresarial-penal-civil"];
    case "Contabilidade/Auditoria": {
      const temas: string[] = [];
      if (t.includes("auditoria") || t.includes("opinião") || t.includes("independência")) {
        temas.push("auditoria-fiscal");
      }
      if (temas.length === 0 || /ativo|passivo|patrim|competência|caixa|permutativo|modificativo|deprecia|amortiza|exaustão/.test(t)) {
        temas.push("contabilidade-fiscal");
      }
      return temas;
    }
    case "Legislação Municipal": {
      const temas: string[] = [];
      if (t.includes("itbi") || t.includes("pat") || t.includes("processo administrativo") || t.includes("recurso")) {
        temas.push("processo-administrativo-tributario");
      }
      if (t.includes("iss") || t.includes("iptu")) {
        temas.push("legislacao-tributaria-municipal");
      }
      if (temas.length === 0) temas.push("legislacao-tributaria-municipal");
      return temas;
    }
    case "LGPD/TI/RLM": {
      if (/juro|lógic|logic|negaç|contrapositiva|proposiç|raciocínio/.test(t)) {
        return ["raciocinio-logico-mat-financeira"];
      }
      return ["ti-analise-dados-lgpd"];
    }
    default:
      console.warn(`  aviso: categoria de flashcard não reconhecida "${nomeAntigo}" -> caiu em legislacao-tributaria-municipal (revise manualmente depois)`);
      return ["legislacao-tributaria-municipal"];
  }
}

async function migrarFlashcards() {
  const caminho = join(LEGACY_DIR, "flashcards-trem.html");
  if (!existsSync(caminho)) {
    console.log("(pulando flashcards: data/legacy/flashcards-trem.html não encontrado)");
    return;
  }
  const fonte = readFileSync(caminho, "utf-8");
  const cards = (extrairArray(fonte, "CARDS") ?? []) as CardLegado[];

  if (cards.length === 0) {
    console.log("Nenhum flashcard encontrado em CARDS.");
    return;
  }

  const linhas: { tema_id: string; pergunta: string; resposta_html: string }[] = [];
  for (const c of cards) {
    const pergunta = c.q ?? "";
    let resposta = c.a ?? "";
    const temas = remapTema(c.m ?? "", `${pergunta} ${resposta}`);

    // Correção conhecida: card antigo de PAT dizia "30 dias" pro recurso
    // voluntário; o Decreto 21.066/2000 art. 34 diz 20 dias.
    if (
      temas.includes("processo-administrativo-tributario") &&
      /recurso volunt[áa]rio/i.test(`${pergunta} ${resposta}`) &&
      /30\s*dias/i.test(resposta)
    ) {
      console.warn(`  corrigindo flashcard de PAT (30 dias -> 20 dias): "${pergunta}"`);
      resposta = resposta.replace(/30\s*dias/gi, "20 dias");
    }

    for (const tema_id of temas) {
      linhas.push({ tema_id, pergunta, resposta_html: resposta });
    }
  }

  const { error } = await supabase.from("flashcards").insert(linhas);
  if (error) console.error("Erro ao inserir flashcards:", error.message);
  else console.log(`OK: ${linhas.length} flashcards migrados (${cards.length} originais, alguns duplicados entre temas).`);
}

async function main() {
  console.log("Migrando conteúdo legado para o Supabase...\n");
  await migrarQuestoes();
  await migrarResumos();
  await migrarFlashcards();
  console.log("\nFeito. Revise os avisos acima.");
}

main();
