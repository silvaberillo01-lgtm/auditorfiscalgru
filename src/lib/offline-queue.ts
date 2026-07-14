"use client";

const CHAVE = "revisar:fila-offline";

export type RevisaoPendente = {
  temaId: string;
  flashcardId: string;
  acertou: boolean;
  ts: number;
};

export function enfileirar(revisao: RevisaoPendente) {
  const fila = lerFila();
  fila.push(revisao);
  localStorage.setItem(CHAVE, JSON.stringify(fila));
}

export function lerFila(): RevisaoPendente[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
  } catch {
    return [];
  }
}

export function limparFila() {
  localStorage.removeItem(CHAVE);
}
