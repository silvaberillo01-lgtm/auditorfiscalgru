/**
 * Popula a tabela `temas` com as 13 áreas do edital (seção 0 do spec).
 *
 * IMPORTANTE: turno/caderno/peso/n_questoes_prova abaixo são placeholders.
 * Confira os valores reais no edital do concurso e ajuste antes (ou depois)
 * de rodar — são fáceis de editar depois direto no Supabase Table Editor,
 * a única coisa que importa é que os 13 `id`s batam com o resto do app.
 *
 * Uso: npx tsx scripts/seed-temas.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local");
  process.exit(1);
}
const supabase = createClient(url, key);

const TEMAS = [
  { id: "lingua-portuguesa", nome: "Língua Portuguesa", turno: "Manhã", caderno: "Básico", peso: 1, n_questoes_prova: 0, ordem_sugerida: 1 },
  { id: "raciocinio-logico-mat-financeira", nome: "Raciocínio Lógico e Matemática Financeira", turno: "Manhã", caderno: "Básico", peso: 1, n_questoes_prova: 0, ordem_sugerida: 2 },
  { id: "ti-analise-dados-lgpd", nome: "TI, Análise de Dados e LGPD", turno: "Manhã", caderno: "Básico", peso: 1, n_questoes_prova: 0, ordem_sugerida: 3 },
  { id: "direito-administrativo", nome: "Direito Administrativo", turno: "Manhã", caderno: "Jurídico", peso: 1, n_questoes_prova: 0, ordem_sugerida: 4 },
  { id: "direito-constitucional", nome: "Direito Constitucional", turno: "Manhã", caderno: "Jurídico", peso: 1, n_questoes_prova: 0, ordem_sugerida: 5 },
  { id: "direito-tributario", nome: "Direito Tributário", turno: "Manhã", caderno: "Jurídico", peso: 2, n_questoes_prova: 0, ordem_sugerida: 6 },
  { id: "direito-empresarial-penal-civil", nome: "Direito Empresarial, Penal e Civil", turno: "Manhã", caderno: "Jurídico", peso: 1, n_questoes_prova: 0, ordem_sugerida: 7 },
  { id: "legislacao-tributaria-municipal", nome: "Legislação Tributária Municipal", turno: "Tarde", caderno: "Tributário", peso: 3, n_questoes_prova: 0, ordem_sugerida: 8 },
  { id: "tributos-municipais", nome: "Tributos Municipais", turno: "Tarde", caderno: "Tributário", peso: 3, n_questoes_prova: 0, ordem_sugerida: 9 },
  { id: "reforma-tributaria", nome: "Reforma Tributária", turno: "Tarde", caderno: "Tributário", peso: 2, n_questoes_prova: 0, ordem_sugerida: 10 },
  { id: "contabilidade-fiscal", nome: "Contabilidade Fiscal", turno: "Tarde", caderno: "Fiscal", peso: 2, n_questoes_prova: 0, ordem_sugerida: 11 },
  { id: "auditoria-fiscal", nome: "Auditoria Fiscal", turno: "Tarde", caderno: "Fiscal", peso: 2, n_questoes_prova: 0, ordem_sugerida: 12 },
  { id: "processo-administrativo-tributario", nome: "Processo Administrativo Tributário", turno: "Tarde", caderno: "Fiscal", peso: 2, n_questoes_prova: 0, ordem_sugerida: 13 },
];

async function main() {
  const { error } = await supabase.from("temas").upsert(TEMAS, { onConflict: "id" });
  if (error) {
    console.error("Erro ao popular temas:", error.message);
    process.exit(1);
  }
  console.log(`OK: ${TEMAS.length} temas inseridos/atualizados.`);
}

main();
