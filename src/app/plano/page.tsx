import Link from "next/link";
import { requireAprovado } from "@/lib/auth";
import { fasesLabel, getPlanoSemanas } from "@/lib/queries";
import { FASE_BADGE, PRAZO_HEX } from "@/lib/fase-ui";
import DeadlineBadge from "@/components/deadline-badge";
import ScrollToCurrent from "@/components/scroll-to-current";

function formatarPeriodo(inicio: string | null, fim: string | null): string {
  if (!inicio || !fim) return "sem data definida";
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" };
  return `${new Date(inicio).toLocaleDateString("pt-BR", opts)} – ${new Date(fim).toLocaleDateString("pt-BR", opts)}`;
}

export default async function PlanoPage() {
  const { user } = await requireAprovado();
  const semanas = await getPlanoSemanas(user.id);

  return (
    <div className="space-y-4">
      <ScrollToCurrent />
      <div>
        <h1 className="text-xl font-semibold text-neutral-100">Plano de estudos</h1>
        <p className="text-sm text-neutral-500">Sua trilha, semana a semana.</p>
      </div>

      <ul className="space-y-0">
        {semanas.map((semana, i) => {
          const cor = PRAZO_HEX[semana.status];
          const ehAtual = semana.status === "atual";
          const ehUltima = i === semanas.length - 1;

          return (
            <li key={semana.semana} className="relative flex gap-4 pb-6">
              {!ehUltima && (
                <span
                  className="absolute left-[15px] top-8 h-full w-0.5 bg-neutral-800"
                  aria-hidden
                />
              )}
              <div
                id={ehAtual ? "semana-atual" : undefined}
                className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                  ehAtual ? "animate-pulse-glow" : ""
                }`}
                style={{ backgroundColor: cor, color: cor }}
              >
                <span className="text-white">{semana.semana}</span>
              </div>

              <div className="min-w-0 flex-1 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-100">
                    Semana {semana.semana} · {formatarPeriodo(semana.periodo_inicio, semana.periodo_fim)}
                  </p>
                  <DeadlineBadge status={semana.status} diasRestantes={semana.diasRestantes} />
                </div>

                {semana.temas.length === 0 ? (
                  <p className="mt-2 text-xs text-neutral-600">Sem temas definidos.</p>
                ) : (
                  <ul className="mt-3 space-y-1.5">
                    {semana.temas.map((tema) => (
                      <li key={tema.id}>
                        <Link
                          href={`/temas/${tema.id}`}
                          className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 hover:bg-neutral-800"
                        >
                          <span className="truncate text-sm text-neutral-300">{tema.nome}</span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${FASE_BADGE[tema.fase]}`}>
                            {fasesLabel(tema.fase)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
