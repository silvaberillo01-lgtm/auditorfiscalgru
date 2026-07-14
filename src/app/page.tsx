import Link from "next/link";
import { requireAprovado } from "@/lib/auth";
import {
  getRevisoesAtrasadas,
  getTemaDaSemana,
  getProgressoProva,
  getStreak,
  fasesLabel,
} from "@/lib/queries";

export default async function HojePage() {
  const { user } = await requireAprovado();
  const [revisoes, temaDaSemana, progressoProva, streak] = await Promise.all([
    getRevisoesAtrasadas(user.id),
    getTemaDaSemana(user.id),
    getProgressoProva(user.id),
    getStreak(user.id),
  ]);

  const totalRevisoes = [...revisoes.values()].reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hoje</h1>
        {streak > 0 && (
          <span className="text-sm text-orange-600 font-medium">🔥 {streak} dia(s)</span>
        )}
      </div>

      {totalRevisoes > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="font-medium text-amber-900">Hoje é dia de revisar</p>
          <ul className="mt-2 text-sm text-amber-800 list-disc list-inside">
            {[...revisoes.entries()].map(([temaId, info]) => (
              <li key={temaId}>
                {info.nome} ({info.count} card{info.count === 1 ? "" : "s"})
              </li>
            ))}
          </ul>
          <Link
            href="/revisar"
            className="mt-3 inline-block rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700"
          >
            Revisar agora
          </Link>
        </div>
      )}

      {temaDaSemana && (
        <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
          <p className="font-medium text-blue-900">Tema da semana</p>
          <p className="mt-1 text-sm text-blue-800">
            {temaDaSemana.tema.nome} — fase: {fasesLabel(temaDaSemana.fase)}
          </p>
          <Link
            href={`/temas/${temaDaSemana.tema.id}`}
            className="mt-3 inline-block rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            Abrir tema
          </Link>
        </div>
      )}

      {!totalRevisoes && !temaDaSemana && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          Sem revisões pendentes e sem plano definido para hoje.{" "}
          <Link href="/temas" className="text-blue-600 hover:underline">
            Escolha um tema para estudar
          </Link>
          .
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-sm text-neutral-600">Progresso da prova</p>
        <p className="mt-1 text-2xl font-semibold">
          {progressoProva.pct}%{" "}
          <span className="text-sm font-normal text-neutral-500">
            ({progressoProva.temasDominados}/{progressoProva.totalTemas} temas)
          </span>
        </p>
      </div>
    </div>
  );
}
