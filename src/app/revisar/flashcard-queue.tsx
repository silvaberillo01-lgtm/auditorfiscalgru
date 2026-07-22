"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { revisarFlashcardAction } from "@/app/actions";
import { enfileirar, lerFila, limparFila } from "@/lib/offline-queue";
import { promptFlashcards } from "@/lib/flashcard-prompt";
import Toast, { type ToastInfo } from "@/components/toast";

type Card = {
  flashcard_id: string;
  tema_id: string;
  tema_nome: string;
  pergunta: string;
  resposta_html: string;
};

async function sincronizarFila() {
  const fila = lerFila();
  if (fila.length === 0) return;
  for (const revisao of fila) {
    try {
      await revisarFlashcardAction({
        temaId: revisao.temaId,
        flashcardId: revisao.flashcardId,
        acertou: revisao.acertou,
      });
    } catch {
      return; // ainda sem conexão de verdade — tenta de novo na próxima
    }
  }
  limparFila();
}

function lerCacheLocal(): Card[] | null {
  if (typeof window === "undefined") return null;
  try {
    const cache = localStorage.getItem("revisar:cards");
    return cache ? JSON.parse(cache) : null;
  } catch {
    return null;
  }
}

export default function FlashcardQueue({ cards: cardsIniciais }: { cards: Card[] }) {
  const [cards] = useState(() =>
    cardsIniciais.length > 0 ? cardsIniciais : (lerCacheLocal() ?? cardsIniciais)
  );
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [toast, setToast] = useState<ToastInfo>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    // cacheia os cards de hoje localmente pro trem sem sinal
    try {
      localStorage.setItem("revisar:cards", JSON.stringify(cardsIniciais));
    } catch {
      // localStorage indisponível (modo privado etc) — segue sem cache local
    }
  }, [cardsIniciais]);

  useEffect(() => {
    sincronizarFila();

    function aoConectar() {
      setOffline(false);
      sincronizarFila();
    }
    function aoDesconectar() {
      setOffline(true);
    }
    window.addEventListener("online", aoConectar);
    window.addEventListener("offline", aoDesconectar);
    return () => {
      window.removeEventListener("online", aoConectar);
      window.removeEventListener("offline", aoDesconectar);
    };
  }, []);

  if (cards.length === 0) {
    return (
      <>
        <p className="text-sm text-neutral-500">Nenhuma revisão pendente hoje. 🎉</p>
        <Toast info={toast} onDone={() => setToast(null)} />
      </>
    );
  }

  if (indice >= cards.length) {
    return (
      <>
        <div className="rounded-2xl border border-[#5E9E6F33] bg-[#5E9E6F14] p-4 text-sm text-[#8ec49c]">
          Revisões de hoje concluídas!
        </div>
        <Toast info={toast} onDone={() => setToast(null)} />
      </>
    );
  }

  const card = cards[indice];

  function avaliar(acertou: boolean) {
    startTransition(async () => {
      try {
        if (offline) throw new Error("offline");
        const resultado = await revisarFlashcardAction({
          temaId: card.tema_id,
          flashcardId: card.flashcard_id,
          acertou,
        });
        if (resultado) setToast(resultado);
        router.refresh();
      } catch {
        enfileirar({
          temaId: card.tema_id,
          flashcardId: card.flashcard_id,
          acertou,
          ts: Date.now(),
        });
      }
      setVirado(false);
      setCopiado(false);
      setIndice((i) => i + 1);
    });
  }

  return (
    <div className="space-y-4">
      <Toast info={toast} onDone={() => setToast(null)} />
      {offline && (
        <p className="text-xs rounded-full bg-[#D9A84E1a] border border-[#D9A84E33] px-3 py-1.5 text-[#e8c179]">
          Sem conexão — suas respostas ficam guardadas e sincronizam automaticamente quando
          voltar o sinal.
        </p>
      )}
      <p className="text-xs text-neutral-500">
        {indice + 1} / {cards.length} · {card.tema_nome}
      </p>
      <div
        onClick={() => setVirado((v) => !v)}
        className="min-h-40 cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900 p-6 flex items-center justify-center text-center"
      >
        {!virado ? (
          <p className="font-medium text-neutral-100">{card.pergunta}</p>
        ) : (
          <div
            className="prose prose-sm prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: card.resposta_html }}
          />
        )}
      </div>
      {!virado ? (
        <button
          onClick={() => setVirado(true)}
          className="w-full rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
        >
          Mostrar resposta
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              disabled={pending}
              onClick={() => avaliar(false)}
              className="flex-1 rounded-full bg-[#E2574C1f] px-4 py-2 text-sm font-medium text-[#ef8880] hover:bg-[#E2574C33] disabled:opacity-50"
            >
              Errei
            </button>
            <button
              disabled={pending}
              onClick={() => avaliar(true)}
              className="flex-1 rounded-full bg-[#5E9E6F1f] px-4 py-2 text-sm font-medium text-[#8ec49c] hover:bg-[#5E9E6F33] disabled:opacity-50"
            >
              Acertei
            </button>
          </div>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(
                promptFlashcards([
                  { tema_nome: card.tema_nome, pergunta: card.pergunta, resposta_html: card.resposta_html },
                ])
              );
              setCopiado(true);
              setTimeout(() => setCopiado(false), 1500);
            }}
            className="w-full rounded-full bg-[#4E8FD91f] px-4 py-2 text-sm font-medium text-[#7db0ea] hover:bg-[#4E8FD933]"
          >
            {copiado ? "Copiado! Cole numa IA 🧠" : "🧠 Não entendi — copiar pra IA"}
          </button>
        </div>
      )}
    </div>
  );
}
