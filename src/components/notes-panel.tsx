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
      className="text-xs text-neutral-500 hover:text-neutral-800 underline"
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
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3">
      <p className="text-sm font-medium text-neutral-900">📝 Suas anotações</p>
      <textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder="Anote alguma coisa sobre este tema..."
        rows={3}
        className="w-full rounded border border-neutral-300 p-2 text-sm"
      />
      <button
        disabled={pending || !conteudo.trim()}
        onClick={salvar}
        className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        Salvar anotação
      </button>

      {anotacoes.length > 0 && (
        <ul className="space-y-2 pt-2 border-t border-neutral-100">
          {anotacoes.map((a) => (
            <li key={a.id} className="text-sm text-neutral-700 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-neutral-400">{formatarData(a.data)}</p>
                <p className="whitespace-pre-wrap">{a.conteudo_md}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <CopiarBotao texto={blocoParaIA(temaNome, a)} />
                <button
                  onClick={() => excluir(a.id)}
                  className="text-xs text-neutral-400 hover:text-red-600"
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
