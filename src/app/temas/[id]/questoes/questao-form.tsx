"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registrarRespostaAction } from "@/app/actions";
import type { Questao } from "@/lib/types";
import Toast, { type ToastInfo } from "@/components/toast";

export default function QuestaoForm({
  temaId,
  questao,
  respostaSalva,
}: {
  temaId: string;
  questao: Questao;
  respostaSalva?: string | null;
}) {
  const [selecionada, setSelecionada] = useState<string | null>(respostaSalva ?? null);
  const [respondida, setRespondida] = useState(!!respostaSalva);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastInfo>(null);
  const router = useRouter();

  const alternativas = questao.alternativas ?? [];
  const correta = selecionada === questao.gabarito;

  function responder(letra: string) {
    if (respondida) return;
    setSelecionada(letra);
    setRespondida(true);
    startTransition(async () => {
      const resultado = await registrarRespostaAction({
        temaId,
        questaoId: questao.id,
        resposta: letra,
        correta: letra === questao.gabarito,
      });
      if (resultado) setToast(resultado);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
      <Toast info={toast} onDone={() => setToast(null)} />
      <p className="font-medium text-neutral-100">{questao.enunciado}</p>
      <div className="space-y-2">
        {alternativas.map((alt) => {
          const isSelecionada = selecionada === alt.letra;
          const isGabarito = respondida && alt.letra === questao.gabarito;
          return (
            <button
              key={alt.letra}
              disabled={respondida || pending}
              onClick={() => responder(alt.letra)}
              className={`block w-full text-left rounded-lg border px-3 py-2 text-sm ${
                isGabarito
                  ? "border-[#5E9E6F] bg-[#5E9E6F1a] text-neutral-100"
                  : isSelecionada
                    ? "border-[#E2574C] bg-[#E2574C1a] text-neutral-100"
                    : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              } disabled:cursor-default`}
            >
              <span className="font-medium">{alt.letra})</span> {alt.texto}
            </button>
          );
        })}
      </div>
      {respondida && (
        <div
          className={`text-sm rounded-lg p-3 ${
            correta ? "bg-[#5E9E6F14] text-[#8ec49c]" : "bg-[#E2574C14] text-[#ef8880]"
          }`}
        >
          <p className="font-medium">{correta ? "Acertou!" : `Errou — gabarito: ${questao.gabarito}`}</p>
          {questao.explicacao && <p className="mt-1">{questao.explicacao}</p>}
          {questao.fonte && <p className="mt-1 text-xs opacity-70">Fonte: {questao.fonte}</p>}
        </div>
      )}
    </div>
  );
}
