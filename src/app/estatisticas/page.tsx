import Link from "next/link";
import { requireAprovado } from "@/lib/auth";
import {
  getTemas,
  getProgressoMap,
  getEstatisticasPorTema,
  getEstatisticasFlashcards,
  getAtividadeRecente,
  getProgressoProva,
  getStreak,
} from "@/lib/queries";
import { DATA_PROVA, diasEntre, hojeISO } from "@/lib/prazo";
import { FASE_BADGE, FASE_BADGE_LABEL } from "@/lib/fase-ui";
import ProgressRing from "@/components/progress-ring";

/** Cor da barra de aproveitamento por faixa: verde >= 80, dourado >= 60, vermelho abaixo. */
function corAproveitamento(pct: number) {
  if (pct >= 80) return { barra: "bg-[#5E9E6F]", texto: "text-[#8ec49c]" };
  if (pct >= 60) return { barra: "bg-[#D9A84E]", texto: "text-[#e8c179]" };
  return { barra: "bg-[#E2574C]", texto: "text-[#ef8880]" };
}

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

export default async function EstatisticasPage() {
  const { user } = await requireAprovado();
  const [temas, progressoMap, stats, flashStats, atividade, progressoProva, streak] =
    await Promise.all([
      getTemas(),
      getProgressoMap(user.id),
      getEstatisticasPorTema(user.id),
      getEstatisticasFlashcards(user.id),
      getAtividadeRecente(user.id, 14),
      getProgressoProva(user.id),
      getStreak(user.id),
    ]);

  const diasAteProva = diasEntre(hojeISO(), DATA_PROVA);
  const pctAcertoGeral =
    stats.totalRespondidas > 0
      ? Math.round((stats.totalAcertos / stats.totalRespondidas) * 100)
      : 0;
  const maxAcoes = Math.max(1, ...atividade.map((a) => a.acoes));

  // Só temas com questões cadastradas entram no ranking; respondidos primeiro,
  // do menor aproveitamento pro maior (fraquezas no topo, é nelas que se foca).
  const ranking = temas
    .map((t) => {
      const e = stats.porTema.get(t.id) ?? { totalQuestoes: 0, respondidas: 0, acertos: 0 };
      const pct = e.respondidas > 0 ? Math.round((e.acertos / e.respondidas) * 100) : null;
      return { tema: t, ...e, pct };
    })
    .filter((r) => r.totalQuestoes > 0)
    .sort((a, b) => {
      if (a.pct === null && b.pct === null) return 0;
      if (a.pct === null) return 1;
      if (b.pct === null) return -1;
      return a.pct - b.pct;
    });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-neutral-100">Estatísticas</h1>

      {/* Contagem regressiva pra prova */}
      <div className="rounded-2xl border border-[#D9A84E33] bg-[#D9A84E0d] p-6 text-center">
        <p className="text-4xl font-bold text-[#e8c179]">{diasAteProva} dias</p>
        <p className="mt-1 text-sm text-neutral-400">
          até a prova · 13 de setembro · ~{Math.ceil(diasAteProva / 7)} semanas
        </p>
      </div>

      {/* Números gerais */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-2xl font-bold text-neutral-100">
            {stats.totalRespondidas}
            <span className="text-sm font-normal text-neutral-500">/{stats.totalQuestoes}</span>
          </p>
          <p className="text-xs text-neutral-500">questões feitas</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <p className={`text-2xl font-bold ${stats.totalRespondidas > 0 ? corAproveitamento(pctAcertoGeral).texto : "text-neutral-100"}`}>
            {stats.totalRespondidas > 0 ? `${pctAcertoGeral}%` : "—"}
          </p>
          <p className="text-xs text-neutral-500">acerto geral</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-2xl font-bold text-neutral-100">{flashStats.totalNaFila}</p>
          <p className="text-xs text-neutral-500">flashcards na fila</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-2xl font-bold text-neutral-100">🔥 {streak}</p>
          <p className="text-xs text-neutral-500">dias seguidos</p>
        </div>
      </div>

      {/* Progresso da prova */}
      <div className="flex items-center gap-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <ProgressRing pct={progressoProva.pct} />
        <div>
          <p className="text-sm text-neutral-500">Progresso da prova</p>
          <p className="text-sm text-neutral-300">
            {progressoProva.temasDominados} de {progressoProva.totalTemas} temas cobertos
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Um tema conta como coberto quando chega na fase de espaçar.
          </p>
        </div>
      </div>

      {/* Atividade dos últimos 14 dias */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <p className="text-sm font-medium text-neutral-100">Atividade — últimos 14 dias</p>
        <div className="mt-4 flex items-end gap-1.5" style={{ height: 72 }}>
          {atividade.map((a) => {
            const altura = a.acoes > 0 ? Math.max(8, Math.round((a.acoes / maxAcoes) * 64)) : 3;
            const hoje = a.data === hojeISO();
            return (
              <div key={a.data} className="flex flex-1 flex-col items-center justify-end gap-1 self-stretch">
                <div
                  title={`${a.data}: ${a.acoes} ação${a.acoes === 1 ? "" : "ões"}`}
                  className={`w-full rounded-sm ${a.acoes > 0 ? "bg-[#5E9E6F]" : "bg-neutral-800"} ${hoje ? "outline outline-1 outline-[#e8c179]" : ""}`}
                  style={{ height: altura }}
                />
                <span className="text-[10px] text-neutral-600">
                  {DIAS_SEMANA[new Date(`${a.data}T00:00:00`).getDay()]}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Cada barra é um dia; a altura é quanto você fez (respostas, revisões, resumos).
        </p>
      </div>

      {/* Aproveitamento por tema */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-neutral-100">Aproveitamento por tema</p>
          <p className="text-xs text-neutral-500">
            Fraquezas primeiro — é nelas que vale focar. Conta a última resposta de cada questão.
          </p>
        </div>
        {ranking.length === 0 && (
          <p className="text-sm text-neutral-500">Nenhuma questão respondida ainda.</p>
        )}
        {ranking.map((r) => {
          const fase = progressoMap.get(r.tema.id)?.fase ?? "nao_iniciado";
          return (
            <div key={r.tema.id}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <Link href={`/temas/${r.tema.id}`} className="truncate text-neutral-200 hover:underline">
                  {r.tema.nome}
                </Link>
                <span className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${FASE_BADGE[fase]}`}>
                    {FASE_BADGE_LABEL[fase]}
                  </span>
                  {r.pct !== null ? (
                    <span className={`text-xs font-semibold ${corAproveitamento(r.pct).texto}`}>
                      {r.acertos}/{r.respondidas} · {r.pct}%
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-600">sem respostas</span>
                  )}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-800">
                {r.pct !== null && (
                  <div
                    className={`h-full rounded-full ${corAproveitamento(r.pct).barra}`}
                    style={{ width: `${Math.max(r.pct, 3)}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Flashcards */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <p className="text-sm font-medium text-neutral-100">Repetição espaçada</p>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-neutral-100">{flashStats.vencendoHoje}</p>
            <p className="text-xs text-neutral-500">pra revisar hoje</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#ef8880]">{flashStats.comErro}</p>
            <p className="text-xs text-neutral-500">cards já errados</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[#cda3e6]">{flashStats.dominados}</p>
            <p className="text-xs text-neutral-500">cards dominados</p>
          </div>
        </div>
        {flashStats.vencendoHoje > 0 && (
          <Link href="/revisar" className="mt-4 block text-center text-sm text-[#7db0ea] hover:underline">
            Revisar agora →
          </Link>
        )}
      </div>
    </div>
  );
}
