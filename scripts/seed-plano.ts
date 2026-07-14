/**
 * Popula `plano_semanas` a partir do array `PLANO` já existente em
 * data/legacy/guia-estudos-ibam-guarulhos.jsx (9 semanas, 11/07 a 13/09/2026).
 *
 * Cada semana do PLANO tem {sem: "Semana N", periodo: "D–D mon", foco: "...",
 * casa: [...], trem: [...]}. O `foco` (+ o texto de `casa`/`trem`, quando
 * ajuda a desambiguar) é mapeado pros temas canônicos abaixo — mapeamento
 * conferido manualmente linha por linha contra o texto real do arquivo,
 * não adivinhado:
 *
 *   Semana 1: Direito Tributário
 *   Semana 2: Legislação Tributária Municipal (ISS+IPTU)
 *   Semana 3: Legislação Tributária Municipal (ITBI) + PAT + Tributos
 *             Municipais (o `casa` menciona explicitamente "'Tributos
 *             Municipais'" além de ITBI/PAT)
 *   Semana 4: Reforma Tributária
 *   Semana 5: Contabilidade Fiscal + Auditoria Fiscal
 *   Semana 6: Direito Administrativo + Direito Constitucional
 *   Semana 7: Direito Empresarial/Penal/Civil + Língua Portuguesa
 *   Semana 8: TI/Análise de Dados/LGPD + Raciocínio Lógico e Mat. Financeira
 *   Semana 9: simulado/consolidação final — sem tema novo, é revisão geral;
 *             mapeada pros 13 temas (é a semana que o guia manda revisar
 *             "todos os blocos" e "TODOS os cartões, sem filtro").
 *
 * Uso: npx tsx scripts/seed-plano.ts
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
const ANO = 2026;

/** Mesma lógica de extração usada em migrate.ts. */
function extrairArray(fonte: string, nomeVar: string): unknown[] | null {
  const regex = new RegExp(`(?:const|let|var)\\s+${nomeVar}\\s*=\\s*(\\[[\\s\\S]*?\\n\\]);`, "m");
  const match = fonte.match(regex);
  if (!match) return null;
  try {
    return new Function(`"use strict"; return (${match[1]});`)();
  } catch (e) {
    console.warn(`Falha ao avaliar array ${nomeVar}:`, e);
    return null;
  }
}

type SemanaLegado = {
  sem: string; // "Semana 1"
  periodo: string; // "11–17 jul"
  foco: string;
  casa: string[];
  trem: string[];
};

const MESES: Record<string, string> = {
  jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06",
  jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12",
};

const TODOS_OS_TEMAS = [
  "lingua-portuguesa",
  "raciocinio-logico-mat-financeira",
  "ti-analise-dados-lgpd",
  "direito-administrativo",
  "direito-constitucional",
  "direito-tributario",
  "direito-empresarial-penal-civil",
  "legislacao-tributaria-municipal",
  "tributos-municipais",
  "reforma-tributaria",
  "contabilidade-fiscal",
  "auditoria-fiscal",
  "processo-administrativo-tributario",
];

/** temas[] por número de semana (1-indexado), conferido contra o texto real do PLANO. */
const TEMAS_POR_SEMANA: Record<number, string[]> = {
  1: ["direito-tributario"],
  2: ["legislacao-tributaria-municipal"],
  3: ["legislacao-tributaria-municipal", "processo-administrativo-tributario", "tributos-municipais"],
  4: ["reforma-tributaria"],
  5: ["contabilidade-fiscal", "auditoria-fiscal"],
  6: ["direito-administrativo", "direito-constitucional"],
  7: ["direito-empresarial-penal-civil", "lingua-portuguesa"],
  8: ["ti-analise-dados-lgpd", "raciocinio-logico-mat-financeira"],
  9: TODOS_OS_TEMAS,
};

/** Extrai {dia, mes} de um lado do período, tipo "17 jul" ou só "17". */
function parseLado(lado: string): { dia: string; mes: string | null } {
  const m = lado.trim().match(/^(\d+)\s*([a-zç]{3})?$/i);
  if (!m) throw new Error(`Não consegui parsear "${lado}"`);
  return { dia: m[1].padStart(2, "0"), mes: m[2] ? MESES[m[2].toLowerCase()] : null };
}

/** "11–17 jul" ou "29 ago–4 set" -> { inicio: "2026-07-11", fim: "2026-07-17" } */
function parsePeriodo(periodo: string): { inicio: string; fim: string } {
  const [ladoEsq, ladoDir] = periodo.split(/[–-]/).map((s) => s.trim());
  const direita = parseLado(ladoDir);
  if (!direita.mes) throw new Error(`Período "${periodo}" sem mês do lado direito`);
  const esquerda = parseLado(ladoEsq);
  const mesEsquerda = esquerda.mes ?? direita.mes;
  return {
    inicio: `${ANO}-${mesEsquerda}-${esquerda.dia}`,
    fim: `${ANO}-${direita.mes}-${direita.dia}`,
  };
}

async function main() {
  const caminho = join(LEGACY_DIR, "guia-estudos-ibam-guarulhos.jsx");
  if (!existsSync(caminho)) {
    console.error("data/legacy/guia-estudos-ibam-guarulhos.jsx não encontrado.");
    process.exit(1);
  }
  const fonte = readFileSync(caminho, "utf-8");
  const plano = (extrairArray(fonte, "PLANO") ?? []) as SemanaLegado[];

  if (plano.length === 0) {
    console.error("Array PLANO não encontrado ou vazio no arquivo legado.");
    process.exit(1);
  }

  const linhas = plano.map((s, i) => {
    const numero = i + 1;
    const matchNum = s.sem.match(/\d+/);
    if (matchNum && Number(matchNum[0]) !== numero) {
      console.warn(`  aviso: "${s.sem}" está na posição ${numero} do array — usando ${numero} como número da semana`);
    }
    const { inicio, fim } = parsePeriodo(s.periodo);
    const temas = TEMAS_POR_SEMANA[numero];
    if (!temas) {
      console.warn(`  aviso: sem mapeamento de temas pra semana ${numero} ("${s.foco}") — pulando`);
      return null;
    }
    return { semana: numero, periodo_inicio: inicio, periodo_fim: fim, temas };
  }).filter((l): l is NonNullable<typeof l> => l !== null);

  const { error } = await supabase.from("plano_semanas").upsert(linhas, { onConflict: "semana" });
  if (error) {
    console.error("Erro ao inserir plano_semanas:", error.message);
    process.exit(1);
  }
  console.log(`OK: ${linhas.length} semanas inseridas/atualizadas em plano_semanas.`);
}

main();
