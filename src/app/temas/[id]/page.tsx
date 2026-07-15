import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/server";
import { requireAprovado } from "@/lib/auth";
import { getTema, getProgresso, getAnotacoesDoTema, getErrosCorrigidosDoTema, fasesLabel } from "@/lib/queries";
import { FASE_BADGE } from "@/lib/fase-ui";
import type { Resumo } from "@/lib/types";
import NotesPanel from "@/components/notes-panel";
import ErrosResumoPanel from "@/components/erros-resumo-panel";
import OpenTracker from "./open-tracker";
import ResumoActions from "./resumo-actions";
import EsquecerButton from "./esquecer-button";

export default async function TemaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireAprovado();
  const supabase = await createClient();
  const [tema, progresso, { data: resumos }, anotacoes, erros] = await Promise.all([
    getTema(id),
    getProgresso(user.id, id),
    supabase.from("resumos").select("*").eq("tema_id", id),
    getAnotacoesDoTema(user.id, id),
    getErrosCorrigidosDoTema(user.id, id),
  ]);

  if (!tema) notFound();

  const mostrarBotaoConcluir = progresso.fase === "entendendo" || progresso.fase === "nao_iniciado";
  const podeTestar = progresso.fase === "testando" || progresso.fase === "corrigindo" || progresso.fase === "espacando" || progresso.fase === "dominado";
  const podeCorrigir = progresso.fase === "corrigindo";

  return (
    <div className="space-y-6">
      <OpenTracker temaId={id} />
      <div>
        <h1 className="text-xl font-semibold text-neutral-100">{tema.nome}</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
          <span>{tema.turno} · {tema.caderno}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold tracking-wide ${FASE_BADGE[progresso.fase]}`}>
            {fasesLabel(progresso.fase)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {podeTestar && (
          <Link
            href={`/temas/${id}/questoes`}
            className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Resolver questões
          </Link>
        )}
        {podeCorrigir && (
          <Link
            href={`/temas/${id}/corrigir`}
            className="rounded-full bg-[#E2574C1f] px-4 py-2 text-sm text-[#ef8880] hover:bg-[#E2574C33]"
          >
            Corrigir erros
          </Link>
        )}
        {podeTestar && (
          <>
            <span className="text-neutral-700">·</span>
            <EsquecerButton temaId={id} temaNome={tema.nome} />
          </>
        )}
      </div>

      {(resumos ?? []).length === 0 && (
        <p className="text-sm text-neutral-500">Sem resumo cadastrado para este tema ainda.</p>
      )}

      {(resumos as Resumo[] | null)?.map((r) => (
        <article key={r.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          {r.titulo && <h2 className="font-medium mb-2 text-neutral-100">{r.titulo}</h2>}
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{r.conteudo_md ?? ""}</ReactMarkdown>
          </div>
          {r.pontos_decorar && r.pontos_decorar.length > 0 && (
            <div className="mt-3 rounded-xl bg-[#D9A84E14] border border-[#D9A84E33] p-3">
              <p className="text-xs font-medium text-[#e8c179] mb-1">★ Decorar</p>
              <ul className="text-sm text-[#ecd3a3] list-disc list-inside">
                {r.pontos_decorar.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </article>
      ))}

      {mostrarBotaoConcluir && <ResumoActions temaId={id} />}

      <ErrosResumoPanel temaNome={tema.nome} erros={erros} />

      <NotesPanel temaId={id} temaNome={tema.nome} anotacoes={anotacoes} />
    </div>
  );
}
