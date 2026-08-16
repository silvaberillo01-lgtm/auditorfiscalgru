"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  anotarSimuladoAction,
  refazerSimuladoAction,
  responderSimuladoAction,
} from "@/app/actions";
import type { Simulado, SimuladoQuestao, SimuladoResposta } from "@/lib/types";

/**
 * Modo prova: marca as alternativas sem feedback imediato (dá pra trocar de
 * resposta à vontade) e só revela acertos/erros + explicações quando o botão
 * "Conferir gabarito" é acionado. Cada questão tem espaço de anotação — bom
 * pra registrar a discussão em dupla antes de conferir.
 */
export default function SimuladoRunner({
  simulado,
  questoes,
  respostasSalvas,
  temaNomes,
}: {
  simulado: Simulado;
  questoes: SimuladoQuestao[];
  respostasSalvas: Record<string, SimuladoResposta>;
  temaNomes: Record<string, string>;
}) {
  const [respostas, setRespostas] = useState<Record<string, string>>(() => {
    const inicial: Record<string, string> = {};
    for (const [qid, r] of Object.entries(respostasSalvas)) {
      if (r.resposta) inicial[qid] = r.resposta;
    }
    return inicial;
  });
  const [anotacoes, setAnotacoes] = useState<Record<string, string>>(() => {
    const inicial: Record<string, string> = {};
    for (const [qid, r] of Object.entries(respostasSalvas)) {
      if (r.anotacao) inicial[qid] = r.anotacao;
    }
    return inicial;
  });
  const [anotacaoAberta, setAnotacaoAberta] = useState<Record<string, boolean>>({});
  const [anotacaoSalva, setAnotacaoSalva] = useState<Record<string, boolean>>({});
  const [mostrarGabarito, setMostrarGabarito] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const total = questoes.length;
  const respondidas = questoes.filter((q) => respostas[q.id]).length;

  const resultado = useMemo(() => {
    if (!mostrarGabarito) return null;
    let acertos = 0;
    const porTema = new Map<string, { nome: string; acertos: number; total: number }>();
    for (const q of questoes) {
      const temaId = q.tema_id ?? "outros";
      const atual = porTema.get(temaId) ?? {
        nome: temaNomes[temaId] ?? temaId,
        acertos: 0,
        total: 0,
      };
      atual.total += 1;
      if (respostas[q.id] && respostas[q.id] === q.gabarito) {
        acertos += 1;
        atual.acertos += 1;
      }
      porTema.set(temaId, atual);
    }
    return { acertos, porTema: [...porTema.values()] };
  }, [mostrarGabarito, questoes, respostas, temaNomes]);

  function responder(questaoId: string, letra: string) {
    if (mostrarGabarito) return;
    setRespostas((prev) => ({ ...prev, [questaoId]: letra }));
    startTransition(async () => {
      await responderSimuladoAction({
        simuladoId: simulado.id,
        questaoId,
        resposta: letra,
      });
    });
  }

  function salvarAnotacao(questaoId: string) {
    startTransition(async () => {
      await anotarSimuladoAction({
        simuladoId: simulado.id,
        questaoId,
        anotacao: anotacoes[questaoId] ?? "",
      });
      setAnotacaoSalva((prev) => ({ ...prev, [questaoId]: true }));
      setTimeout(
        () => setAnotacaoSalva((prev) => ({ ...prev, [questaoId]: false })),
        1500
      );
    });
  }

  function refazer() {
    if (
      !window.confirm(
        "Refazer o simulado apaga SUAS respostas e anotações deste simulado (só as suas, e só daqui — o caderno de questões normal não é tocado). Continuar?"
      )
    )
      return;
    startTransition(async () => {
      await refazerSimuladoAction(simulado.id);
      setRespostas({});
      setAnotacoes({});
      setMostrarGabarito(false);
      router.refresh();
    });
  }

  function conferirGabarito() {
    if (
      respondidas < total &&
      !window.confirm(
        `Ainda faltam ${total - respondidas} questões sem resposta — elas contam como erro. Conferir o gabarito mesmo assim?`
      )
    )
      return;
    setMostrarGabarito(true);
    document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-100">{simulado.titulo}</h1>
        {simulado.descricao && (
          <p className="mt-1 text-sm text-neutral-400">{simulado.descricao}</p>
        )}
      </div>

      {/* barra de status + mapa de questões */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <p className="text-neutral-300">
            {mostrarGabarito && resultado ? (
              <>
                <span className="font-semibold text-neutral-100">
                  {resultado.acertos}/{total}
                </span>{" "}
                acertos ({Math.round((resultado.acertos / total) * 100)}%)
              </>
            ) : (
              <>
                <span className="font-semibold text-neutral-100">{respondidas}</span>/{total}{" "}
                respondidas
              </>
            )}
          </p>
          <button
            onClick={refazer}
            disabled={pending || respondidas === 0}
            className="text-xs text-neutral-500 hover:text-[#ef8880] underline disabled:opacity-40"
          >
            Refazer simulado
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {questoes.map((q) => {
            const marcada = !!respostas[q.id];
            const acertou = mostrarGabarito && respostas[q.id] === q.gabarito;
            const cor = mostrarGabarito
              ? acertou
                ? "bg-[#5E9E6F33] text-[#8ec49c] border-[#5E9E6F66]"
                : "bg-[#E2574C33] text-[#ef8880] border-[#E2574C66]"
              : marcada
                ? "bg-neutral-100 text-neutral-900 border-neutral-100"
                : "bg-neutral-950 text-neutral-500 border-neutral-700";
            return (
              <a
                key={q.id}
                href={`#q-${q.numero}`}
                className={`flex h-7 w-7 items-center justify-center rounded border text-[11px] font-medium ${cor}`}
              >
                {q.numero}
              </a>
            );
          })}
        </div>
      </div>

      {/* resultado (só depois de conferir) */}
      {mostrarGabarito && resultado && (
        <div
          id="resultado"
          className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-3 scroll-mt-4"
        >
          <p className="font-medium text-neutral-100">
            Resultado: {resultado.acertos}/{total} (
            {Math.round((resultado.acertos / total) * 100)}%)
          </p>
          <ul className="space-y-1 text-sm">
            {resultado.porTema.map((t) => (
              <li key={t.nome} className="flex items-center justify-between gap-3">
                <span className="text-neutral-400">{t.nome}</span>
                <span
                  className={
                    t.acertos === t.total
                      ? "text-[#8ec49c]"
                      : t.acertos / t.total >= 0.6
                        ? "text-[#e3c084]"
                        : "text-[#ef8880]"
                  }
                >
                  {t.acertos}/{t.total}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-neutral-800 pt-3">
            <p className="mb-2 text-xs font-medium text-neutral-400">Gabarito oficial</p>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {questoes.map((q) => (
                <span
                  key={q.id}
                  className="rounded border border-neutral-700 bg-neutral-950 px-1.5 py-0.5 text-neutral-300"
                >
                  {q.numero}
                  <span className="text-neutral-500">:</span>
                  <span className="font-semibold text-neutral-100">{q.gabarito}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* questões */}
      <div className="space-y-4">
        {questoes.map((q) => {
          const selecionada = respostas[q.id] ?? null;
          const acertou = selecionada === q.gabarito;
          const temAnotacao = !!(anotacoes[q.id] ?? "").trim();
          const aberta = anotacaoAberta[q.id] ?? temAnotacao;
          return (
            <div
              key={q.id}
              id={`q-${q.numero}`}
              className="scroll-mt-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-neutral-100">
                  <span className="text-neutral-500">{q.numero}.</span> {q.enunciado}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {q.tema_id && (
                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-neutral-400">
                    {temaNomes[q.tema_id] ?? q.tema_id}
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 ${
                    q.origem === "real"
                      ? "bg-[#4E8FD91a] text-[#8ab6e3]"
                      : "bg-[#B97BD91a] text-[#cfa3e3]"
                  }`}
                >
                  {q.origem === "real" ? "Prova real IBAM" : "Inédita estilo IBAM"}
                </span>
              </div>

              <div className="space-y-2">
                {(q.alternativas ?? []).map((alt) => {
                  const isSelecionada = selecionada === alt.letra;
                  const isGabarito = mostrarGabarito && alt.letra === q.gabarito;
                  const isErrada = mostrarGabarito && isSelecionada && !isGabarito;
                  return (
                    <button
                      key={alt.letra}
                      disabled={mostrarGabarito}
                      onClick={() => responder(q.id, alt.letra)}
                      className={`block w-full text-left rounded-lg border px-3 py-2 text-sm transition ${
                        isGabarito
                          ? "border-[#5E9E6F] bg-[#5E9E6F1a] text-neutral-100"
                          : isErrada
                            ? "border-[#E2574C] bg-[#E2574C1a] text-neutral-100"
                            : isSelecionada
                              ? "border-neutral-100 bg-neutral-100/10 text-neutral-100"
                              : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      } disabled:cursor-default`}
                    >
                      <span className="font-medium">{alt.letra})</span> {alt.texto}
                    </button>
                  );
                })}
              </div>

              {mostrarGabarito && (
                <div
                  className={`text-sm rounded-lg p-3 ${
                    acertou
                      ? "bg-[#5E9E6F14] text-[#8ec49c]"
                      : "bg-[#E2574C14] text-[#ef8880]"
                  }`}
                >
                  <p className="font-medium">
                    {acertou
                      ? "Acertou!"
                      : selecionada
                        ? `Errou — gabarito: ${q.gabarito}`
                        : `Em branco — gabarito: ${q.gabarito}`}
                  </p>
                  {q.explicacao && <p className="mt-1">{q.explicacao}</p>}
                  {q.fonte && <p className="mt-1 text-xs opacity-70">Fonte: {q.fonte}</p>}
                </div>
              )}

              <div className="border-t border-neutral-800 pt-2">
                <button
                  onClick={() =>
                    setAnotacaoAberta((prev) => ({ ...prev, [q.id]: !aberta }))
                  }
                  className="text-xs text-neutral-500 hover:text-neutral-200"
                >
                  📝 {aberta ? "Esconder anotação" : temAnotacao ? "Ver anotação" : "Anotar"}
                </button>
                {aberta && (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={anotacoes[q.id] ?? ""}
                      onChange={(e) =>
                        setAnotacoes((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Raciocínio, dúvida, o que discutir com o parceiro de estudo..."
                      rows={2}
                      className="w-full rounded border border-neutral-700 bg-neutral-950 p-2 text-sm text-neutral-100 placeholder:text-neutral-500"
                    />
                    <button
                      onClick={() => salvarAnotacao(q.id)}
                      disabled={pending}
                      className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
                    >
                      {anotacaoSalva[q.id] ? "Salvo!" : "Salvar anotação"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* rodapé fixo com o botão de conferir */}
      {!mostrarGabarito && (
        <div className="sticky bottom-4">
          <button
            onClick={conferirGabarito}
            disabled={pending || respondidas === 0}
            className="w-full rounded-full bg-[#5E9E6F] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#6fb281] disabled:opacity-50"
          >
            Conferir gabarito ({respondidas}/{total})
          </button>
        </div>
      )}
    </div>
  );
}
