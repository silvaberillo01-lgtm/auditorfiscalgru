"use client";

import { useState } from "react";

export type ItemRevisaoFlashcard = {
  temaNome: string;
  pergunta: string;
  respostaHtml: string;
  anotacao: string | null;
  acertou: boolean;
};

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function blocoParaIA(itens: ItemRevisaoFlashcard[]) {
  const partes = itens.map((e) => {
    const linhas = [
      `### ${e.pergunta} — ${e.temaNome}`,
      `Resposta certa: ${stripHtml(e.respostaHtml)}`,
      `Resultado: ${e.acertou ? "acertei, mas quero aprofundar" : "errei"}`,
    ];
    if (e.anotacao) linhas.push(`Minha anotação: ${e.anotacao}`);
    return linhas.join("\n");
  });

  const instrucoes = `Sou leigo nesses temas — estou revisando flashcards de repetição espaçada pra um concurso. Alguns eu errei, outros anotei alguma coisa mesmo acertando porque quero entender melhor. Pra cada flashcard abaixo:

1. Se eu errei, explique a resposta certa nos meus termos, sem jargão sem explicar antes, e me ajude a entender por que eu errei.
2. Se eu escrevi uma anotação, comente ela: diga se meu raciocínio estava certo, incompleto ou só decorado sem entender, e complete o que faltar.
3. Se esse tema é algo que eu erro com frequência, aponte um jeito diferente de fixar (analogia, mnemônico, o que for) já que o jeito atual não está funcionando.
4. Termine com uma pergunta rápida pra eu testar se realmente entendi, sem me dar a resposta.

Vá um de cada vez e espere eu responder antes de seguir pro próximo, se possível.`;

  return `${instrucoes}\n\n${partes.join("\n\n")}`;
}

export default function CopiarRevisaoFlashcards({ itens }: { itens: ItemRevisaoFlashcard[] }) {
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
            Cards que você errou ou anotou algo nesta sessão — pronto pra colar numa IA.
          </p>
        </div>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(blocoParaIA(itens));
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
          {itens.map((e, i) => (
            <li key={i} className="text-sm text-neutral-300">
              <p className="font-medium text-neutral-200">
                {e.pergunta}{" "}
                <span className={e.acertou ? "text-[#8ec49c]" : "text-[#ef8880]"}>
                  ({e.acertou ? "acertou" : "errou"})
                </span>
              </p>
              {e.anotacao && <p className="mt-1 text-neutral-400">Sua anotação: {e.anotacao}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
