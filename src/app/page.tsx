import Link from "next/link";
import { requireAprovado } from "@/lib/auth";
import {
  getRevisoesAtrasadas,
  getTemaDaSemana,
  getProgressoProva,
  getStreak,
} from "@/lib/queries";
import { FASE_BADGE, FASE_BADGE_LABEL, rotaDaFase, labelAcaoDaFase } from "@/lib/fase-ui";
import ProgressRing from "@/components/progress-ring";

export default async function HojePage() {
  const { user } = await requireAprovado();
  const [revisoes, temaDaSemana, progressoProva, streak] = await Promise.all([
    getRevisoesAtrasadas(user.id),
    getTemaDaSemana(user.id),
    getProgressoProva(user.id),
    getStreak(user.id),
  ]);

  const totalRevisoes = [...revisoes.values()].reduce((a, b) => a + b.count, 0);
  const temRevisoes = totalRevisoes > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hoje</h1>
        {streak > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
            🔥 {streak} dia{streak === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Card principal */}
      {temRevisoes ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <span className="inline-block rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold tracking-wide text-green-700">
            {FASE_BADGE_LABEL.espacando}
          </span>
          <p className="mt-3 text-2xl font-bold text-neutral-900">Hoje é dia de revisar</p>
          <ul className="mt-3 space-y-1 text-sm text-neutral-600">
            {[...revisoes.entries()].map(([temaId, info]) => (
              <li key={temaId}>
                {info.nome} — {info.count} card{info.count === 1 ? "" : "s"}
              </li>
            ))}
          </ul>
          <Link
            href="/revisar"
            className="mt-5 inline-block rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            Revisar agora ({totalRevisoes})
          </Link>
        </div>
      ) : temaDaSemana ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${FASE_BADGE[temaDaSemana.fase]}`}
          >
            {FASE_BADGE_LABEL[temaDaSemana.fase]}
          </span>
          <p className="mt-3 text-2xl font-bold text-neutral-900">{temaDaSemana.tema.nome}</p>
          <p className="mt-1 text-sm text-neutral-500">Tema da semana — semana {temaDaSemana.semana}</p>
          <Link
            href={rotaDaFase(temaDaSemana.tema.id, temaDaSemana.fase)}
            className="mt-5 inline-block rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            {labelAcaoDaFase(temaDaSemana.fase)}
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm text-sm text-neutral-600">
          Sem revisões pendentes e sem plano definido para hoje.{" "}
          <Link href="/temas" className="text-blue-600 hover:underline">
            Escolha um tema para estudar
          </Link>
          .
        </div>
      )}

      {/* Card secundário: o outro item pendente, menor */}
      {temRevisoes && temaDaSemana && (
        <Link
          href={rotaDaFase(temaDaSemana.tema.id, temaDaSemana.fase)}
          className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm hover:border-neutral-300"
        >
          <div>
            <p className="text-sm font-medium text-neutral-900">{temaDaSemana.tema.nome}</p>
            <p className="text-xs text-neutral-500">Tema da semana {temaDaSemana.semana}</p>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide ${FASE_BADGE[temaDaSemana.fase]}`}
          >
            {FASE_BADGE_LABEL[temaDaSemana.fase]}
          </span>
        </Link>
      )}

      {/* Progresso da prova */}
      <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <ProgressRing pct={progressoProva.pct} />
        <div>
          <p className="text-sm text-neutral-500">Progresso da prova</p>
          <p className="text-sm text-neutral-700">
            {progressoProva.temasDominados} de {progressoProva.totalTemas} temas cobertos
          </p>
        </div>
      </div>
    </div>
  );
}
