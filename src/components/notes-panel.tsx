"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarAnotacaoAction, excluirAnotacaoAction } from "@/app/actions";
import type { Anotacao } from "@/lib/types";

function formatarData(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}

function blocoParaIA(temaNome: string, anotacao: Anotacao) {
  return `## ${temaNome} — ${formatarData(anotacao.data)}\n\n${anotacao.conteudo_md ?? ""}`;
}

function CopiarBotao({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1500);
      }}
      className="text-xs text-neutral-500 hover:text-neutral-200 underline"
    >
      {copiado ? "Copiado!" : "Copiar para IA"}
    </button>
  );
}

export default function NotesPanel({
  temaId,
  temaNome,
  anotacoes,
}: {
  temaId: string;
  temaNome: string;
  anotacoes: Anotacao[];
}) {
  const [conteudo, setConteudo] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function salvar() {
    if (!conteudo.trim()) return;
    startTransition(async () => {
      await criarAnotacaoAction({ temaId, conteudo });
      setConteudo("");
      router.refresh();
    });
  }

  function excluir(id: string) {
    startTransition(async () => {
      await excluirAnotacaoAction(id, temaId);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-sm space-y-3">
      <p className="text-sm font-medium text-neutral-100">📝 Suas anotações</p>
      <textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder="Anote alguma coisa sobre este tema..."
        rows={3}
        className="w-full rounded border border-neutral-700 bg-neutral-950 p-2 text-sm text-neutral-100 placeholder:text-neutral-500"
      />
      <button
        disabled={pending || !conteudo.trim()}
        onClick={salvar}
        className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
      >
        Salvar anotação
      </button>

      {anotacoes.length > 0 && (
        <ul className="space-y-2 pt-2 border-t border-neutral-800">
          {anotacoes.map((a) => (
            <li key={a.id} className="text-sm text-neutral-300 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-neutral-500">{formatarData(a.data)}</p>
                <p className="whitespace-pre-wrap">{a.conteudo_md}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <CopiarBotao texto={blocoParaIA(temaNome, a)} />
                <button
                  onClick={() => excluir(a.id)}
                  className="text-xs text-neutral-500 hover:text-[#ef8880]"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
