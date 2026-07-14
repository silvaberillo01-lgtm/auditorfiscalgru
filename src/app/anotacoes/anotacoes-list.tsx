"use client";

import { useMemo, useState } from "react";
import type { Tema } from "@/lib/types";

type AnotacaoComTema = {
  id: string;
  tema_id: string | null;
  tema_nome: string | null;
  data: string;
  conteudo_md: string | null;
};

function formatarData(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function blocoParaIA(temaNome: string | null, data: string, conteudo: string | null) {
  return `## ${temaNome ?? "Sem tema"} — ${new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR")}\n\n${conteudo ?? ""}`;
}

function CopiarBotao({ texto, label = "Copiar para IA" }: { texto: string; label?: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1500);
      }}
      className="text-xs text-neutral-500 hover:text-neutral-800 underline shrink-0"
    >
      {copiado ? "Copiado!" : label}
    </button>
  );
}

export default function AnotacoesList({
  anotacoes,
  temas,
}: {
  anotacoes: AnotacaoComTema[];
  temas: Tema[];
}) {
  const [filtroTema, setFiltroTema] = useState<string>("todos");

  const filtradas = useMemo(
    () => (filtroTema === "todos" ? anotacoes : anotacoes.filter((a) => a.tema_id === filtroTema)),
    [anotacoes, filtroTema]
  );

  const porData = useMemo(() => {
    const grupos = new Map<string, AnotacaoComTema[]>();
    for (const a of filtradas) {
      const lista = grupos.get(a.data) ?? [];
      lista.push(a);
      grupos.set(a.data, lista);
    }
    return [...grupos.entries()];
  }, [filtradas]);

  return (
    <div className="space-y-6">
      <select
        value={filtroTema}
        onChange={(e) => setFiltroTema(e.target.value)}
        className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
      >
        <option value="todos">Todos os temas</option>
        {temas.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nome}
          </option>
        ))}
      </select>

      {porData.length === 0 && (
        <p className="text-sm text-neutral-500">Nenhuma anotação ainda.</p>
      )}

      {porData.map(([data, itens]) => (
        <div key={data} className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold capitalize text-neutral-700">{formatarData(data)}</h2>
            <CopiarBotao
              label="Copiar tudo do dia"
              texto={itens.map((a) => blocoParaIA(a.tema_nome, a.data, a.conteudo_md)).join("\n\n")}
            />
          </div>
          <div className="space-y-2">
            {itens.map((a) => (
              <div key={a.id} className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-neutral-500">{a.tema_nome ?? "Sem tema"}</p>
                  <CopiarBotao texto={blocoParaIA(a.tema_nome, a.data, a.conteudo_md)} />
                </div>
                <p className="mt-1 text-sm text-neutral-800 whitespace-pre-wrap">{a.conteudo_md}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
