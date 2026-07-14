/**
 * Migra os 3 artefatos antigos (caderno de questões, guia de resumos,
 * flashcards HTML) para o Supabase, remapeando tudo para os 13 temas
 * canônicos (seção 0 e 5 do spec).
 *
 * Pré-requisito: rode `scripts/seed-temas.ts` antes (os temas precisam
 * existir por causa da foreign key).
 *
 * Coloque os arquivos originais em `data/legacy/`:
 *   - estudo-ibam-guarulhos.jsx   (arrays ORIGINAIS e VARIACOES)
 *   - guia-estudos-ibam-guarulhos.jsx (array RESUMOS)
 *   - flashcards-trem.html       (array CARDS num <script>)
 *
 * Uso: npx tsx scripts/migrate.ts
 */
import "dotenv/config";
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

/**
 * Mapa de remapeamento de taxonomia (seção 0 do spec).
 * Recebe o nome de tema "antigo" (flashcards/resumos) + o texto do item,
 * devolve o(s) tema_id canônico(s).
 */
function remapTema(nomeAntigo: string, textoItem: string): string[] {
  const t = textoItem.toLowerCase();
  const nome = nomeAntigo.toLowerCase();

  if (nome.includes("direito tributário") && !nome.includes("municipal")) {
    return ["direito-tributario"];
  }
  if (nome.includes("reforma tributária")) {
    return ["reforma-tributaria"];
  }
  if (nome.includes("pat") || nome.includes("processo adm")) {
    return ["processo-administrativo-tributario"];
  }
  if (nome.includes("contabilidade") || nome.includes("auditoria")) {
    const temas: string[] = [];
    if (t.includes("auditoria")) temas.push("auditoria-fiscal");
    if (t.includes("contabil") || t.includes("balanço") || t.includes("balanco") || t.includes("demonstra")) {
      temas.push("contabilidade-fiscal");
    }
    return temas.length > 0 ? temas : ["contabilidade-fiscal", "auditoria-fiscal"];
  }
  if (nome.includes("legislação municipal") || nome.includes("legislacao municipal")) {
    const temas: string[] = [];
    if (t.includes("itbi") || t.includes("pat") || t.includes("processo administrativo")) {
      temas.push("processo-administrativo-tributario");
    }
    if (t.includes("iss") || t.includes("iptu") || t.includes("cosip") || t.includes("taxa")) {
      temas.push("legislacao-tributaria-municipal");
    }
    if (temas.length === 0) temas.push("legislacao-tributaria-municipal");
    return temas;
  }

  console.warn(`  aviso: tema antigo não mapeado "${nomeAntigo}" -> caiu em legislacao-tributaria-municipal (revise manualmente depois)`);
  return ["legislacao-tributaria-municipal"];
}

async function migrarQuestoes() {
  const caminho = join(LEGACY_DIR, "estudo-ibam-guarulhos.jsx");
  if (!existsSync(caminho)) {
    console.log("(pulando questões: data/legacy/estudo-ibam-guarulhos.jsx não encontrado)");
    return;
  }
  const fonte = readFileSync(caminho, "utf-8");
  const originais = (extrairArray(fonte, "ORIGINAIS") ?? []) as Record<string, unknown>[];
  const variacoes = (extrairArray(fonte, "VARIACOES") ?? []) as Record<string, unknown>[];

  const linhas = ([
    ...originais.map((q) => ({ ...q, origem: "real" })),
    ...variacoes.map((q) => ({ ...q, origem: "variacao" })),
  ] as Record<string, unknown>[]).map((q) => ({
    tema_id: q.tema_id ?? q.tema ?? q.area,
    origem: q.origem,
    enunciado: q.enunciado ?? q.pergunta,
    alternativas: q.alternativas,
    gabarito: q.gabarito ?? q.resposta,
    explicacao: q.explicacao,
    fonte: q.fonte,
  }));

  if (linhas.length === 0) {
    console.log("Nenhuma questão encontrada em ORIGINAIS/VARIACOES — confira os nomes dos arrays no arquivo.");
    return;
  }

  // Correção conhecida: questões antigas de PAT que citam "30 dias" pro
  // recurso voluntário estão desatualizadas — o Decreto 21.066/2000 art. 34
  // diz 20 dias. Só avisa (não reescreve alternativas automaticamente,
  // porque pode quebrar o gabarito) — revise manualmente as linhas listadas.
  for (const q of linhas) {
    const textoCompleto = JSON.stringify(q);
    if (
      /recurso volunt[áa]rio/i.test(textoCompleto) &&
      /30\s*dias/i.test(textoCompleto) &&
      /processo administrativo|pat\b/i.test(textoCompleto)
    ) {
      console.warn(`  aviso: questão sobre PAT menciona "30 dias" pro recurso voluntário — confira manualmente, o correto é 20 dias (Decreto 21.066/2000, art. 34): "${String(q.enunciado).slice(0, 80)}..."`);
    }
  }

  const { error } = await supabase.from("questoes").insert(linhas);
  if (error) console.error("Erro ao inserir questões:", error.message);
  else console.log(`OK: ${linhas.length} questões migradas.`);
}

async function migrarResumos() {
  const caminho = join(LEGACY_DIR, "guia-estudos-ibam-guarulhos.jsx");
  if (!existsSync(caminho)) {
    console.log("(pulando resumos: data/legacy/guia-estudos-ibam-guarulhos.jsx não encontrado)");
    return;
  }
  const fonte = readFileSync(caminho, "utf-8");
  const resumos = (extrairArray(fonte, "RESUMOS") ?? []) as Record<string, unknown>[];

  const linhas = resumos.map((r) => ({
    tema_id: r.tema_id ?? r.tema ?? r.area,
    titulo: r.titulo,
    conteudo_md: r.conteudo_md ?? r.conteudo ?? r.texto,
    pontos_decorar: r.pontos_decorar ?? r.decorar ?? [],
  }));

  if (linhas.length === 0) {
    console.log("Nenhum resumo encontrado em RESUMOS — confira o nome do array no arquivo.");
    return;
  }

  const { error } = await supabase.from("resumos").insert(linhas);
  if (error) console.error("Erro ao inserir resumos:", error.message);
  else console.log(`OK: ${linhas.length} resumos migrados.`);
}

async function migrarFlashcards() {
  const caminho = join(LEGACY_DIR, "flashcards-trem.html");
  if (!existsSync(caminho)) {
    console.log("(pulando flashcards: data/legacy/flashcards-trem.html não encontrado)");
    return;
  }
  const fonte = readFileSync(caminho, "utf-8");
  const cards = (extrairArray(fonte, "CARDS") ?? []) as Record<string, string>[];

  if (cards.length === 0) {
    console.log("Nenhum flashcard encontrado em CARDS — confira o nome do array no HTML.");
    return;
  }

  const linhas: { tema_id: string; pergunta: string; resposta_html: string }[] = [];
  for (const c of cards) {
    const nomeAntigo = c.m ?? c.tema ?? c.area ?? "";
    const pergunta = c.p ?? c.pergunta ?? c.q ?? "";
    let resposta = c.r ?? c.resposta ?? c.a ?? "";
    const temas = remapTema(nomeAntigo, `${pergunta} ${resposta}`);

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
  console.log("\nFeito. Revise os avisos acima — remapeamentos incertos caem em legislacao-tributaria-municipal por padrão.");
}

main();
