import Link from "next/link";
import { requireAprovado } from "@/lib/auth";
import {
  getRevisoesAtrasadas,
  getTemaDaSemana,
  getSemanaDoTema,
  getProgressoProva,
  getStreak,
} from "@/lib/queries";
import { FASE_BADGE, FASE_BADGE_LABEL, FASE_SOLIDA, rotaDaFase, labelAcaoDaFase } from "@/lib/fase-ui";
import ProgressRing from "@/components/progress-ring";
import DeadlineBadge from "@/components/deadline-badge";

export default async function HojePage() {
  const { user } = await requireAprovado();
  const [revisoes, temaDaSemana, progressoProva, streak] = await Promise.all([
    getRevisoesAtrasadas(user.id),
    getTemaDaSemana(user.id),
    getProgressoProva(user.id),
    getStreak(user.id),
  ]);
  const semana = temaDaSemana ? await getSemanaDoTema(user.id, temaDaSemana.tema.id) : null;

  const totalRevisoes = [...revisoes.values()].reduce((a, b) => a + b.count, 0);
  const temRevisoes = totalRevisoes > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-100">Hoje</h1>
        {streak > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-[#D9A84E1f] px-3 py-1 text-sm font-semibold text-[#e8c179]">
            🔥 {streak} dia{streak === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Card principal */}
      {temRevisoes ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${FASE_BADGE.espacando}`}>
            {FASE_BADGE_LABEL.espacando}
          </span>
          <p className="mt-3 text-2xl font-bold text-neutral-100">Hoje é dia de revisar</p>
          <ul className="mt-3 space-y-1 text-sm text-neutral-400">
            {[...revisoes.entries()].map(([temaId, info]) => (
              <li key={temaId}>
                {info.nome} — {info.count} card{info.count === 1 ? "" : "s"}
              </li>
            ))}
          </ul>
          <Link
            href="/revisar"
            className={`mt-5 inline-block rounded-full ${FASE_SOLIDA.espacando} px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90`}
          >
            Revisar agora ({totalRevisoes})
          </Link>
        </div>
      ) : temaDaSemana ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${FASE_BADGE[temaDaSemana.fase]}`}
          >
            {FASE_BADGE_LABEL[temaDaSemana.fase]}
          </span>
          <p className="mt-3 text-2xl font-bold text-neutral-100">{temaDaSemana.tema.nome}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-sm text-neutral-500">Tema da semana — semana {temaDaSemana.semana}</p>
            {semana && <DeadlineBadge status={semana.status} diasRestantes={semana.diasRestantes} />}
          </div>
          <Link
            href={rotaDaFase(temaDaSemana.tema.id, temaDaSemana.fase)}
            className={`mt-5 inline-block rounded-full ${FASE_SOLIDA[temaDaSemana.fase]} px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90`}
          >
            {labelAcaoDaFase(temaDaSemana.fase)}
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm text-sm text-neutral-400">
          Sem revisões pendentes e sem plano definido para hoje.{" "}
          <Link href="/temas" className="text-[#7db0ea] hover:underline">
            Escolha um tema para estudar
          </Link>
          .
        </div>
      )}

      {/* Card secundário: tema da semana, quando o principal virou revisão de flashcards —
          mantém prazo e ação próprios, porque é uma tarefa independente das revisões atrasadas */}
      {temRevisoes && temaDaSemana && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 shadow-sm">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide ${FASE_BADGE[temaDaSemana.fase]}`}
          >
            {FASE_BADGE_LABEL[temaDaSemana.fase]}
          </span>
          <p className="mt-2 text-base font-semibold text-neutral-100">{temaDaSemana.tema.nome}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-xs text-neutral-500">Tema da semana {temaDaSemana.semana}</p>
            {semana && <DeadlineBadge status={semana.status} diasRestantes={semana.diasRestantes} />}
          </div>
          <Link
            href={rotaDaFase(temaDaSemana.tema.id, temaDaSemana.fase)}
            className={`mt-3 inline-block rounded-full ${FASE_SOLIDA[temaDaSemana.fase]} px-4 py-2 text-xs font-semibold text-white hover:opacity-90`}
          >
            {labelAcaoDaFase(temaDaSemana.fase)}
          </Link>
        </div>
      )}

      {/* Progresso da prova */}
      <div className="flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-sm">
        <ProgressRing pct={progressoProva.pct} />
        <div>
          <p className="text-sm text-neutral-500">Progresso da prova</p>
          <p className="text-sm text-neutral-300">
            {progressoProva.temasDominados} de {progressoProva.totalTemas} temas cobertos
          </p>
        </div>
      </div>

      <Link href="/plano" className="block text-center text-sm text-[#7db0ea] hover:underline">
        Ver plano completo →
      </Link>
    </div>
  );
}
