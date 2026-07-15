"use client";

import { useState } from "react";

type Erro = {
  id: string;
  resposta: string | null;
  raciocinio: string | null;
  questao: { enunciado: string; gabarito: string | null; explicacao: string | null } | null;
};

function blocoParaIA(temaNome: string, erros: Erro[]) {
  const partes = erros.map((e) => {
    const linhas = [`### ${e.questao?.enunciado ?? ""}`];
    if (e.resposta) linhas.push(`Você respondeu: ${e.resposta}`);
    if (e.questao?.gabarito) linhas.push(`Gabarito: ${e.questao.gabarito}`);
    if (e.questao?.explicacao) linhas.push(`Explicação: ${e.questao.explicacao}`);
    if (e.raciocinio) linhas.push(`Seu raciocínio: ${e.raciocinio}`);
    return linhas.join("\n");
  });
  return `## Erros — ${temaNome}\n\n${partes.join("\n\n")}`;
}

export default function ErrosResumoPanel({ temaNome, erros }: { temaNome: string; erros: Erro[] }) {
  const [copiado, setCopiado] = useState(false);
  const [aberto, setAberto] = useState(false);

  if (erros.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#E2574C33] bg-[#E2574C0d] p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-neutral-100">
            🧠 Erros pra aprofundar ({erros.length})
          </p>
          <p className="text-xs text-neutral-500">
            Copie e cole numa IA pra debater e revisar os pontos que você errou.
          </p>
        </div>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(blocoParaIA(temaNome, erros));
            setCopiado(true);
            setTimeout(() => setCopiado(false), 1500);
          }}
          className="shrink-0 rounded-full bg-[#E2574C1f] px-3 py-1.5 text-xs font-medium text-[#ef8880] hover:bg-[#E2574C33]"
        >
          {copiado ? "Copiado!" : "Copiar para IA"}
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
          {erros.map((e) => (
            <li key={e.id} className="text-sm text-neutral-300">
              <p className="font-medium text-neutral-200">{e.questao?.enunciado}</p>
              {e.raciocinio && <p className="mt-1 text-neutral-400">Seu raciocínio: {e.raciocinio}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
