import Link from "next/link";
import { requireAprovado } from "@/lib/auth";
import {
  getRevisoesAtrasadas,
  getPlanoSemanas,
  getProximoTemaParaEstudar,
  getProgressoProva,
  getStreak,
} from "@/lib/queries";
import { FASE_BADGE, FASE_BADGE_LABEL, FASE_SOLIDA, rotaDaFase, labelAcaoDaFase } from "@/lib/fase-ui";
import ProgressRing from "@/components/progress-ring";
import DeadlineBadge from "@/components/deadline-badge";

export default async function HojePage() {
  const { user } = await requireAprovado();
  const [revisoes, planoSemanas, progressoProva, streak] = await Promise.all([
    getRevisoesAtrasadas(user.id),
    getPlanoSemanas(user.id),
    getProgressoProva(user.id),
    getStreak(user.id),
  ]);
  const temaEstudo = await getProximoTemaParaEstudar(user.id, planoSemanas);

  const totalRevisoes = [...revisoes.values()].reduce((a, b) => a + b.count, 0);
  const temRevisoes = totalRevisoes > 0;
  const semTarefa = !temRevisoes && !temaEstudo;

  // Card de revisão (aparece sempre que houver revisão vencida hoje).
  const cardRevisao = (
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
  );

  // Card do próximo tema pra estudar ativamente (entender/testar/corrigir).
  const cardEstudo = temaEstudo && (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
      <span
        className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${FASE_BADGE[temaEstudo.fase]}`}
      >
        {FASE_BADGE_LABEL[temaEstudo.fase]}
      </span>
      <p className="mt-3 text-2xl font-bold text-neutral-100">{temaEstudo.tema.nome}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="text-sm text-neutral-500">Tema da semana — semana {temaEstudo.semana.semana}</p>
        <DeadlineBadge status={temaEstudo.semana.status} diasRestantes={temaEstudo.semana.diasRestantes} />
      </div>
      <Link
        href={rotaDaFase(temaEstudo.tema.id, temaEstudo.fase)}
        className={`mt-5 inline-block rounded-full ${FASE_SOLIDA[temaEstudo.fase]} px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90`}
      >
        {labelAcaoDaFase(temaEstudo.fase)}
      </Link>
    </div>
  );

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

      {/* Revisar (se houver revisão vencida) e o próximo tema pra estudar aparecem
          os dois — um não esconde o outro, pra você nunca ficar sem o que avançar. */}
      {temRevisoes && cardRevisao}
      {cardEstudo}

      {semTarefa && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-sm">
          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${FASE_BADGE.dominado}`}>
            EM DIA
          </span>
          <p className="mt-3 text-2xl font-bold text-neutral-100">Você está em dia! 🎉</p>
          <p className="mt-2 text-sm text-neutral-400">
            Nenhuma revisão vencida hoje e nenhum tema pendente pra estudar. Volte amanhã pras
            próximas revisões, ou{" "}
            <Link href="/temas" className="text-[#7db0ea] hover:underline">
              treine um tema extra
            </Link>
            .
          </p>
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
