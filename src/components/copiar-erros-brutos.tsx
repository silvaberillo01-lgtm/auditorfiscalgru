"use client";

import { useState } from "react";

type Alternativa = { letra: string; texto: string };
type ErroBruto = {
  enunciado: string;
  alternativas: Alternativa[] | null;
  gabarito: string | null;
  resposta: string | null;
};

function blocoParaIA(temaNome: string, erros: ErroBruto[]) {
  const questoes = erros.map((e, i) => {
    const alts = (e.alternativas ?? []).map((a) => `${a.letra}) ${a.texto}`).join("\n");
    return `### Questão ${i + 1}\n${e.enunciado}\n\n${alts}\n\nMinha resposta: ${e.resposta ?? "—"}\nGabarito: ${e.gabarito ?? "—"}`;
  });

  const instrucoes = `Sou leigo em "${temaNome}" — não tenho formação na área, então preciso que você explique como se eu nunca tivesse visto esses termos antes. Errei as questões abaixo estudando pra um concurso. Pra cada uma:

1. Primeiro, liste os termos técnicos/jurídicos do enunciado e das alternativas que uma pessoa leiga não entenderia de cara, e explique cada um em 1-2 frases simples, sem definição de dicionário.
2. Depois, me dê uma ANALOGIA ou exemplo do dia a dia (fora do direito/contabilidade) que ilustre a lógica por trás da regra — algo fácil de guardar na memória.
3. Explique por que a alternativa que eu escolhi está errada e por que o gabarito está certo, conectando com a analogia.
4. Se a questão tiver uma "pegadinha" (uma palavra ou detalhe que muda tudo), aponte exatamente qual foi e por quê.

Não repita o texto da explicação como se eu já soubesse do que se trata — assuma que preciso do contexto desde o início. Pode ser direto e informal, o objetivo é eu conseguir explicar de volta com minhas palavras depois.`;

  return `${instrucoes}\n\n${questoes.join("\n\n")}`;
}

export default function CopiarErrosBrutos({ temaNome, erros }: { temaNome: string; erros: ErroBruto[] }) {
  const [copiado, setCopiado] = useState(false);

  if (erros.length === 0) return null;

  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(blocoParaIA(temaNome, erros));
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1500);
      }}
      className="rounded-full bg-[#4E8FD91f] px-4 py-2 text-sm font-medium text-[#7db0ea] hover:bg-[#4E8FD933]"
    >
      {copiado ? "Copiado!" : `Copiar ${erros.length} erro${erros.length === 1 ? "" : "s"} para IA`}
    </button>
  );
}
