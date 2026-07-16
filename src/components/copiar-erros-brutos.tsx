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

  return `Errei essas questões estudando "${temaNome}". Me ajuda a entender cada uma — por que a minha alternativa está errada e por que o gabarito está certo — e me aponta o que eu preciso aprofundar no tema:\n\n${questoes.join("\n\n")}`;
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
