"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { revisarFlashcardAction } from "@/app/actions";

type Card = {
  flashcard_id: string;
  tema_id: string;
  tema_nome: string;
  pergunta: string;
  resposta_html: string;
};

export default function FlashcardQueue({ cards }: { cards: Card[] }) {
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (cards.length === 0) {
    return <p className="text-sm text-neutral-500">Nenhuma revisão pendente hoje. 🎉</p>;
  }

  if (indice >= cards.length) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Revisões de hoje concluídas!
      </div>
    );
  }

  const card = cards[indice];

  function avaliar(acertou: boolean) {
    startTransition(async () => {
      await revisarFlashcardAction({
        temaId: card.tema_id,
        flashcardId: card.flashcard_id,
        acertou,
      });
      setVirado(false);
      setIndice((i) => i + 1);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500">
        {indice + 1} / {cards.length} · {card.tema_nome}
      </p>
      <div
        onClick={() => setVirado((v) => !v)}
        className="min-h-40 cursor-pointer rounded-lg border border-neutral-200 bg-white p-6 flex items-center justify-center text-center"
      >
        {!virado ? (
          <p className="font-medium">{card.pergunta}</p>
        ) : (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: card.resposta_html }}
          />
        )}
      </div>
      {!virado ? (
        <button
          onClick={() => setVirado(true)}
          className="w-full rounded border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
        >
          Mostrar resposta
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            disabled={pending}
            onClick={() => avaliar(false)}
            className="flex-1 rounded bg-red-100 px-4 py-2 text-sm text-red-800 hover:bg-red-200 disabled:opacity-50"
          >
            Errei
          </button>
          <button
            disabled={pending}
            onClick={() => avaliar(true)}
            className="flex-1 rounded bg-emerald-100 px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-200 disabled:opacity-50"
          >
            Acertei
          </button>
        </div>
      )}
    </div>
  );
}
