"use client";

import { useState } from "react";
import { promptResumo, type ResumoParaIA } from "@/lib/resumo-prompt";

export default function CopiarResumoButton({
  temaNome,
  resumo,
}: {
  temaNome: string;
  resumo: ResumoParaIA;
}) {
  const [copiado, setCopiado] = useState(false);

  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(promptResumo(temaNome, resumo));
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1500);
      }}
      className="shrink-0 rounded-full bg-[#4E8FD91f] px-3 py-1.5 text-xs font-medium text-[#7db0ea] hover:bg-[#4E8FD933]"
    >
      {copiado ? "Copiado!" : "🧠 Copiar para IA"}
    </button>
  );
}
