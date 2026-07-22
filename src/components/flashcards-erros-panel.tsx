"use client";

import { useState } from "react";
import { promptFlashcards } from "@/lib/flashcard-prompt";
import type { FlashcardErrado } from "@/lib/queries";

export default function FlashcardsErrosPanel({ cards }: { cards: FlashcardErrado[] }) {
  const [copiado, setCopiado] = useState(false);
  const [aberto, setAberto] = useState(false);

  if (cards.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#E2574C33] bg-[#E2574C0d] p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-neutral-100">
            🧠 Flashcards que você mais erra ({cards.length})
          </p>
          <p className="text-xs text-neutral-500">
            Copie tudo e cole numa IA pra ela te explicar com analogias e exemplos.
          </p>
        </div>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(promptFlashcards(cards));
            setCopiado(true);
            setTimeout(() => setCopiado(false), 1500);
          }}
          className="shrink-0 rounded-full bg-[#E2574C1f] px-3 py-1.5 text-xs font-medium text-[#ef8880] hover:bg-[#E2574C33]"
        >
          {copiado ? "Copiado!" : "Copiar tudo para IA"}
        </button>
      </div>

      <button
        onClick={() => setAberto((v) => !v)}
        className="text-xs text-neutral-500 hover:text-neutral-300 underline"
      >
        {aberto ? "Esconder detalhes" : "Ver detalhes"}
      </button>

      {aberto && (
        <ul className="space-y-2 pt-1 border-t border-[#E2574C33]">
          {cards.map((c) => (
            <li key={c.flashcard_id} className="text-sm text-neutral-300">
              <p className="font-medium text-neutral-200">{c.pergunta}</p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {c.tema_nome} · errado {c.erros}x
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
