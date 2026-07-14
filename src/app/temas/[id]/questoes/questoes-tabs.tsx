"use client";

import { useState } from "react";
import type { Questao } from "@/lib/types";
import QuestaoForm from "./questao-form";

export default function QuestoesTabs({ temaId, questoes }: { temaId: string; questoes: Questao[] }) {
  const reais = questoes.filter((q) => q.origem === "real");
  const variacoes = questoes.filter((q) => q.origem === "variacao");
  const [aba, setAba] = useState<"real" | "variacao">(reais.length > 0 ? "real" : "variacao");

  const listaAtual = aba === "real" ? reais : variacoes;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-full bg-neutral-900 p-1 w-fit border border-neutral-800">
        <button
          onClick={() => setAba("real")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            aba === "real" ? "bg-[#4E8FD9] text-white" : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Reais ({reais.length})
        </button>
        <button
          onClick={() => setAba("variacao")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            aba === "variacao" ? "bg-[#B97BD9] text-white" : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Variações IBAM ({variacoes.length})
        </button>
      </div>

      {listaAtual.length === 0 && (
        <p className="text-sm text-neutral-500">
          Nenhuma questão {aba === "real" ? "real" : "de variação"} cadastrada para este tema ainda.
        </p>
      )}

      <div className="space-y-4">
        {listaAtual.map((q) => (
          <QuestaoForm key={q.id} temaId={temaId} questao={q} />
        ))}
      </div>
    </div>
  );
}
