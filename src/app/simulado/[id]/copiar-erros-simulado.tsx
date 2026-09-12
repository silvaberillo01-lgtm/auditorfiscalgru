"use client";

import { useState } from "react";
import type { Alternativa } from "@/lib/types";

export type ItemRevisaoSimulado = {
  numero: number;
  temaNome: string;
  enunciado: string | null;
  alternativas: Alternativa[] | null;
  minhaResposta: string | null;
  gabarito: string | null;
  explicacao: string | null;
  anotacao: string | null;
  acertou: boolean;
};

function blocoQuestao(e: ItemRevisaoSimulado) {
  const alts = (e.alternativas ?? []).map((a) => `${a.letra}) ${a.texto}`).join("\n");
  const statusResposta = e.minhaResposta
    ? `Minha resposta: ${e.minhaResposta} (${e.acertou ? "acertei" : "errei"})`
    : "Minha resposta: — (não respondida)";
  const linhas = [
    `### Questão ${e.numero} — ${e.temaNome}`,
    e.enunciado ?? "",
    "",
    alts,
    "",
    statusResposta,
    `Gabarito: ${e.gabarito ?? "—"}`,
  ];
  if (e.explicacao) linhas.push(`Explicação: ${e.explicacao}`);
  if (e.anotacao) linhas.push(`Minha anotação: ${e.anotacao}`);
  return linhas.join("\n");
}

function blocoParaIA(simuladoTitulo: string, itens: ItemRevisaoSimulado[]) {
  const partes = itens.map(blocoQuestao);

  const instrucoes = `Sou leigo nesses temas — estou revisando questões de um simulado pra concurso. Algumas eu errei, outras acertei mas anotei alguma coisa na hora porque quero aprofundar mesmo assim. Pra cada questão abaixo:

1. Se eu errei, explique por que minha resposta está errada e por que o gabarito está certo, nos meus termos, sem jargão sem explicar antes.
2. Se eu acertei mas escrevi uma anotação, comente a anotação: diga se meu raciocínio estava certo, incompleto ou só coincidência, e complete o que faltar.
3. Se a questão tiver uma "pegadinha" (uma palavra ou detalhe que muda tudo), aponte exatamente qual foi.
4. Termine com uma pergunta rápida de múltipla escolha pra eu testar se realmente entendi, sem me dar a resposta.

Vá uma de cada vez e espere eu responder antes de seguir pra próxima, se possível.`;

  return `${instrucoes}\n\n## ${simuladoTitulo}\n\n${partes.join("\n\n")}`;
}

export default function CopiarErrosSimulado({
  simuladoTitulo,
  itens,
}: {
  simuladoTitulo: string;
  itens: ItemRevisaoSimulado[];
}) {
  const [copiado, setCopiado] = useState(false);
  const [aberto, setAberto] = useState(false);

  if (itens.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#E2574C33] bg-[#E2574C0d] p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-neutral-100">
            🧠 Pra revisar ({itens.length})
          </p>
          <p className="text-xs text-neutral-500">
            Questões que você errou ou anotou algo — enunciado, gabarito, explicação e sua
            anotação, pronto pra colar numa IA.
          </p>
        </div>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(blocoParaIA(simuladoTitulo, itens));
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
        <ul className="space-y-3 pt-1 border-t border-[#E2574C33]">
          {itens.map((e) => (
            <li key={e.numero} className="text-sm text-neutral-300">
              <p className="mb-1 flex items-center gap-2">
                <span className="font-medium text-neutral-200">
                  Questão {e.numero} — {e.temaNome}
                </span>
                <span className={e.acertou ? "text-[#8ec49c]" : "text-[#ef8880]"}>
                  ({e.acertou ? "acertou" : "errou"})
                </span>
              </p>
              {/* Mesmo texto que vai pro clipboard — pra nunca divergir do que "Copiar para IA" gera */}
              <pre className="whitespace-pre-wrap rounded-lg bg-neutral-950 p-3 text-xs text-neutral-300">
                {blocoQuestao(e)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
