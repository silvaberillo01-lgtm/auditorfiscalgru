import Link from "next/link";
import { requireAprovado } from "@/lib/auth";
import { getTemas, getProgressoMap, getEstatisticasPorTema, fasesLabel } from "@/lib/queries";
import { FASE_BADGE } from "@/lib/fase-ui";

export default async function TemasPage() {
  const { user } = await requireAprovado();
  const [temas, progressoMap, estatisticas] = await Promise.all([
    getTemas(),
    getProgressoMap(user.id),
    getEstatisticasPorTema(user.id),
  ]);

  const semCobertura = temas.filter((t) => (estatisticas.porTema.get(t.id)?.respondidas ?? 0) === 0);
  const pctGeral =
    estatisticas.totalRespondidas > 0
      ? Math.round((estatisticas.totalAcertos / estatisticas.totalRespondidas) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-neutral-100">Forças e fraquezas por área do edital</h1>

      <ul className="space-y-2">
        {temas.map((tema) => {
          const fase = progressoMap.get(tema.id)?.fase ?? "nao_iniciado";
          const stat = estatisticas.porTema.get(tema.id);
          const total = stat?.totalQuestoes ?? 0;
          const respondidas = stat?.respondidas ?? 0;
          const acertos = stat?.acertos ?? 0;
          const pct = respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0;

          return (
            <li key={tema.id}>
              <Link
                href={`/temas/${tema.id}`}
                className="block rounded-xl border border-neutral-800 bg-neutral-900 p-3 shadow-sm hover:border-neutral-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-100 truncate">{tema.nome}</p>
                    <p className="text-xs text-neutral-500">
                      {tema.turno} · peso {tema.peso} · {tema.n_questoes_prova}q na prova
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {respondidas > 0 ? (
                      <span className="text-xs text-neutral-400">
                        {respondidas}/{total} · {pct}%
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-600">sem questões respondidas</span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${FASE_BADGE[fase]}`}>
                      {fasesLabel(fase)}
                    </span>
                  </div>
                </div>
                {respondidas > 0 && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-800">
                    <div
                      className="h-1.5 rounded-full bg-[#B97BD9]"
                      style={{ width: `${total > 0 ? (respondidas / total) * 100 : 0}%` }}
                    />
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {semCobertura.length > 0 && (
        <p className="text-xs text-[#e8c179]">
          <strong>Sem cobertura ainda:</strong> {semCobertura.map((t) => t.nome).join(" · ")}
        </p>
      )}

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-neutral-500 mb-3">VISÃO GERAL</p>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-neutral-100">
              {estatisticas.totalRespondidas} <span className="text-sm font-normal text-neutral-500">/ {estatisticas.totalQuestoes}</span>
            </p>
            <p className="text-xs text-neutral-500">respondidas</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#8ec49c]">{estatisticas.totalAcertos}</p>
            <p className="text-xs text-neutral-500">acertos</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#ef8880]">{estatisticas.totalErros}</p>
            <p className="text-xs text-neutral-500">erros</p>
          </div>
          <div>
            <p className="text-lg font-bold text-neutral-100">{pctGeral}%</p>
            <p className="text-xs text-neutral-500">aproveitamento bruto</p>
          </div>
        </div>
      </div>
    </div>
  );
}
