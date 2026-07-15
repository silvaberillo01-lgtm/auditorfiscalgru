import { FASE_HEX, FASE_ICON, FASE_PASSOS, FASE_STEP_LABEL } from "@/lib/fase-ui";
import { diasEntre, hojeISO } from "@/lib/prazo";
import type { TemaProgresso } from "@/lib/types";

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Timestamp de quando cada etapa foi concluída (ou seja, quando a próxima começou). */
function dataConclusao(progresso: TemaProgresso, index: number): string | null {
  if (index === 0) return progresso.entendido_em; // fim de "entendendo"
  if (index === 1) return progresso.testado_em; // fim de "testando"
  if (index === 2) return progresso.corrigido_em; // fim de "corrigindo"
  return null; // "espacando" e "dominado" não têm timestamp próprio no schema
}

export default function PhaseStepper({ progresso }: { progresso: TemaProgresso }) {
  const idxAtual = FASE_PASSOS.indexOf(progresso.fase);

  return (
    <div className="flex items-start justify-between gap-1 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      {FASE_PASSOS.map((fase, i) => {
        const isConcluido = idxAtual > i;
        const isAtual = i === idxAtual;
        const conclusaoEm = isConcluido ? dataConclusao(progresso, i) : null;
        const inicioEm = isAtual ? dataConclusao(progresso, i - 1) : null;

        return (
          <div key={fase} className="flex flex-1 flex-col items-center text-center">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-base ${
                isAtual ? "animate-pulse-glow" : ""
              }`}
              style={{
                backgroundColor: isConcluido || isAtual ? `${FASE_HEX[fase]}33` : undefined,
                color: isConcluido || isAtual ? FASE_HEX[fase] : "#4b5563",
              }}
            >
              {FASE_ICON[fase]}
            </div>
            <p
              className={`mt-1.5 text-[11px] font-semibold ${
                isConcluido || isAtual ? "text-neutral-200" : "text-neutral-600"
              }`}
            >
              {FASE_STEP_LABEL[fase]}
            </p>
            {conclusaoEm && <p className="text-[10px] text-neutral-500">{formatarData(conclusaoEm)}</p>}
            {isAtual && !conclusaoEm && (
              <p className="text-[10px] text-neutral-500">
                {fase === "dominado"
                  ? "🎉 concluído"
                  : inicioEm
                    ? `há ${diasEntre(inicioEm.slice(0, 10), hojeISO())}d`
                    : "em andamento"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
