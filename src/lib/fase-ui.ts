import type { Fase } from "@/lib/types";

/** Azul=entender, laranja=testar, vermelho=corrigir, verde=espaçar. */
export const FASE_BADGE: Record<Fase, string> = {
  nao_iniciado: "bg-neutral-100 text-neutral-600",
  entendendo: "bg-blue-100 text-blue-700",
  testando: "bg-orange-100 text-orange-700",
  corrigindo: "bg-red-100 text-red-700",
  espacando: "bg-green-100 text-green-700",
  dominado: "bg-indigo-600 text-white",
};

/** Rótulo curto pro badge, no estilo do spec (ENTENDER/TESTAR/CORRIGIR/ESPAÇAR). */
export const FASE_BADGE_LABEL: Record<Fase, string> = {
  nao_iniciado: "NÃO INICIADO",
  entendendo: "ENTENDER",
  testando: "TESTAR",
  corrigindo: "CORRIGIR",
  espacando: "ESPAÇAR",
  dominado: "DOMINADO",
};

export const FASE_SOLIDA: Record<Fase, string> = {
  nao_iniciado: "bg-neutral-600",
  entendendo: "bg-blue-600",
  testando: "bg-orange-600",
  corrigindo: "bg-red-600",
  espacando: "bg-green-600",
  dominado: "bg-indigo-600",
};

/** Pra onde o botão de ação do card principal deve levar, dada a fase atual do tema. */
export function rotaDaFase(temaId: string, fase: Fase): string {
  switch (fase) {
    case "testando":
      return `/temas/${temaId}/questoes`;
    case "corrigindo":
      return `/temas/${temaId}/corrigir`;
    case "espacando":
    case "dominado":
      return "/revisar";
    default:
      return `/temas/${temaId}`;
  }
}

export function labelAcaoDaFase(fase: Fase): string {
  switch (fase) {
    case "testando":
      return "Resolver questões";
    case "corrigindo":
      return "Corrigir erros";
    case "espacando":
    case "dominado":
      return "Revisar flashcards";
    default:
      return "Abrir resumo";
  }
}
