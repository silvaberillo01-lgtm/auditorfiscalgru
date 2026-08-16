"use client";

import { useState } from "react";
import type { Alternativa } from "@/lib/types";

export type ErroSimulado = {
  numero: number;
  temaNome: string;
  enunciado: string | null;
  alternativas: Alternativa[] | null;
  minhaResposta: string;
  gabarito: string | null;
  explicacao: string | null;
  anotacao: string | null;
};

function blocoParaIA(simuladoTitulo: string, erros: ErroSimulado[]) {
  const partes = erros.map((e) => {
    const alts = (e.alternativas ?? []).map((a) => `${a.letra}) ${a.texto}`).join("\n");
    const linhas = [
      `### Questão ${e.numero} — ${e.temaNome}`,
      e.enunciado ?? "",
      "",
      alts,
      "",
      `Minha resposta: ${e.minhaResposta}`,
      `Gabarito: ${e.gabarito ?? "—"}`,
    ];
    if (e.explicacao) linhas.push(`Explicação: ${e.explicacao}`);
    if (e.anotacao) linhas.push(`Minha anotação: ${e.anotacao}`);
    return linhas.join("\n");
  });

  const instrucoes = `Sou leigo nesses temas — errei essas questões num simulado pra concurso e quero entender onde travei o raciocínio. Pra cada questão abaixo:

1. Explique por que minha resposta está errada e por que o gabarito está certo, nos meus termos, sem jargão sem explicar antes.
2. Se eu escrevi uma anotação, aponte especificamente onde meu raciocínio desviou do certo.
3. Se a questão tiver uma "pegadinha" (uma palavra ou detalhe que muda tudo), aponte exatamente qual foi.
4. Termine com uma pergunta rápida de múltipla escolha pra eu testar se realmente entendi, sem me dar a resposta.

Vá uma de cada vez e espere eu responder antes de seguir pra próxima, se possível.`;

  return `${instrucoes}\n\n## ${simuladoTitulo}\n\n${partes.join("\n\n")}`;
}

export default function CopiarErrosSimulado({
  simuladoTitulo,
  erros,
}: {
  simuladoTitulo: string;
  erros: ErroSimulado[];
}) {
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
            Enunciado, gabarito, explicação e suas anotações — pronto pra colar numa IA.
          </p>
        </div>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(blocoParaIA(simuladoTitulo, erros));
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
            <li key={e.numero} className="text-sm text-neutral-300">
              <p className="font-medium text-neutral-200">
                {e.numero}. {e.enunciado}
              </p>
              {e.anotacao && <p className="mt-1 text-neutral-400">Sua anotação: {e.anotacao}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
