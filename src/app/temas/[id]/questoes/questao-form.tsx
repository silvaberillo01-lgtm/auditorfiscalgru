"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registrarRespostaAction } from "@/app/actions";
import type { Questao } from "@/lib/types";

export default function QuestaoForm({ temaId, questao }: { temaId: string; questao: Questao }) {
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [respondida, setRespondida] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const alternativas = questao.alternativas ?? [];
  const correta = selecionada === questao.gabarito;

  function responder(letra: string) {
    if (respondida) return;
    setSelecionada(letra);
    setRespondida(true);
    startTransition(async () => {
      await registrarRespostaAction({
        temaId,
        questaoId: questao.id,
        resposta: letra,
        correta: letra === questao.gabarito,
      });
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <p className="font-medium">{questao.enunciado}</p>
      <div className="space-y-2">
        {alternativas.map((alt) => {
          const isSelecionada = selecionada === alt.letra;
          const isGabarito = respondida && alt.letra === questao.gabarito;
          return (
            <button
              key={alt.letra}
              disabled={respondida || pending}
              onClick={() => responder(alt.letra)}
              className={`block w-full text-left rounded border px-3 py-2 text-sm ${
                isGabarito
                  ? "border-emerald-400 bg-emerald-50"
                  : isSelecionada
                    ? "border-red-400 bg-red-50"
                    : "border-neutral-200 hover:bg-neutral-50"
              } disabled:cursor-default`}
            >
              <span className="font-medium">{alt.letra})</span> {alt.texto}
            </button>
          );
        })}
      </div>
      {respondida && (
        <div className={`text-sm rounded p-3 ${correta ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
          <p className="font-medium">{correta ? "Acertou!" : `Errou — gabarito: ${questao.gabarito}`}</p>
          {questao.explicacao && <p className="mt-1">{questao.explicacao}</p>}
          {questao.fonte && <p className="mt-1 text-xs opacity-70">Fonte: {questao.fonte}</p>}
        </div>
      )}
    </div>
  );
}
