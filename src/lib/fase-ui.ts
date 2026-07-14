import type { Fase } from "@/lib/types";

/**
 * Mesma paleta do guia de estudos antigo: azul=entender, dourado=testar,
 * vermelho=corrigir, verde=espaçar, roxo=dominado.
 */
export const FASE_HEX: Record<Fase, string> = {
  nao_iniciado: "#6b7280",
  entendendo: "#4E8FD9",
  testando: "#D9A84E",
  corrigindo: "#E2574C",
  espacando: "#5E9E6F",
  dominado: "#B97BD9",
};

/** Badge: fundo com a cor da fase em ~15% de opacidade, texto sólido na cor da fase. */
export const FASE_BADGE: Record<Fase, string> = {
  nao_iniciado: "bg-[#6b72801f] text-[#9ca3af]",
  entendendo: "bg-[#4E8FD91f] text-[#7db0ea]",
  testando: "bg-[#D9A84E1f] text-[#e8c179]",
  corrigindo: "bg-[#E2574C1f] text-[#ef8880]",
  espacando: "bg-[#5E9E6F1f] text-[#8ec49c]",
  dominado: "bg-[#B97BD91f] text-[#cda3e6]",
};

export const FASE_SOLIDA: Record<Fase, string> = {
  nao_iniciado: "bg-[#6b7280]",
  entendendo: "bg-[#4E8FD9]",
  testando: "bg-[#D9A84E]",
  corrigindo: "bg-[#E2574C]",
  espacando: "bg-[#5E9E6F]",
  dominado: "bg-[#B97BD9]",
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
