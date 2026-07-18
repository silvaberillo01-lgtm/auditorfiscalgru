import Link from "next/link";
import { requireAprovado } from "@/lib/auth";
import {
  getRevisoesAtrasadas,
  getFocoDeHoje,
  getProgressoProva,
  getStreak,
} from "@/lib/queries";
import { FASE_BADGE, FASE_BADGE_LABEL, FASE_SOLIDA, rotaDaFase, labelAcaoDaFase } from "@/lib/fase-ui";
import ProgressRing from "@/components/progress-ring";
import DeadlineBadge from "@/components/deadline-badge";

export default async function HojePage() {
  const { user } = await requireAprovado();
  const [revisoes, foco, progressoProva, streak] = await Promise.all([
    getRevisoesAtrasadas(user.id),
    getFocoDeHoje(user.id),
    getProgressoProva(user.id),
    getStreak(user.id),
  ]);

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
      ) : foco ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${FASE_BADGE[foco.fase]}`}
            >
              {FASE_BADGE_LABEL[foco.fase]}
            </span>
            {foco.adiantado && (
              <span className="inline-block rounded-full bg-[#5E9E6F1f] px-2.5 py-1 text-xs font-bold tracking-wide text-[#8ec49c]">
                🚀 ADIANTADO
              </span>
            )}
          </div>
          <p className="mt-3 text-2xl font-bold text-neutral-100">{foco.tema.nome}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-sm text-neutral-500">
              {foco.adiantado
                ? `Você está em dia — puxando a semana ${foco.semana}`
                : `Tema da semana — semana ${foco.semana}`}
            </p>
            {!foco.adiantado && (
              <DeadlineBadge status={foco.status} diasRestantes={foco.diasRestantes} />
            )}
          </div>
          <Link
            href={rotaDaFase(foco.tema.id, foco.fase)}
            className={`mt-5 inline-block rounded-full ${FASE_SOLIDA[foco.fase]} px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90`}
          >
            {labelAcaoDaFase(foco.fase)}
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#5E9E6F33] bg-[#5E9E6F14] p-6 shadow-sm">
          <span className="inline-block rounded-full bg-[#5E9E6F1f] px-2.5 py-1 text-xs font-bold tracking-wide text-[#8ec49c]">
            ✅ EM DIA
          </span>
          <p className="mt-3 text-2xl font-bold text-neutral-100">Tudo coberto por enquanto</p>
          <p className="mt-1 text-sm text-neutral-400">
            Todos os temas do plano já passaram da fase de estudo. Sem revisão pendente hoje —
            aproveite ou revise à frente.
          </p>
          <Link
            href="/revisar"
            className={`mt-5 inline-block rounded-full ${FASE_SOLIDA.espacando} px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90`}
          >
            Revisar mesmo assim
          </Link>
        </div>
      )}

      {/* Card secundário: o outro item pendente, menor */}
      {temRevisoes && foco && (
        <Link
          href={rotaDaFase(foco.tema.id, foco.fase)}
          className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 shadow-sm hover:border-neutral-700"
        >
          <div>
            <p className="text-sm font-medium text-neutral-100">{foco.tema.nome}</p>
            <p className="text-xs text-neutral-500">
              {foco.adiantado ? `Adiantando — semana ${foco.semana}` : `Tema da semana ${foco.semana}`}
            </p>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide ${FASE_BADGE[foco.fase]}`}
          >
            {FASE_BADGE_LABEL[foco.fase]}
          </span>
        </Link>
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
