import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase";
import { getTema, getProgresso, fasesLabel } from "@/lib/queries";
import type { Resumo } from "@/lib/types";
import OpenTracker from "./open-tracker";
import ResumoActions from "./resumo-actions";

export default async function TemaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tema, progresso, { data: resumos }] = await Promise.all([
    getTema(id),
    getProgresso(id),
    supabase.from("resumos").select("*").eq("tema_id", id),
  ]);

  if (!tema) notFound();

  const mostrarBotaoConcluir = progresso.fase === "entendendo" || progresso.fase === "nao_iniciado";
  const podeTestar = progresso.fase === "testando" || progresso.fase === "corrigindo" || progresso.fase === "espacando" || progresso.fase === "dominado";
  const podeCorrigir = progresso.fase === "corrigindo";

  return (
    <div className="space-y-6">
      <OpenTracker temaId={id} />
      <div>
        <h1 className="text-xl font-semibold">{tema.nome}</h1>
        <p className="text-sm text-neutral-500">
          {tema.turno} · {tema.caderno} · fase atual: {fasesLabel(progresso.fase)}
        </p>
      </div>

      <div className="flex gap-2">
        {podeTestar && (
          <Link
            href={`/temas/${id}/questoes`}
            className="rounded border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100"
          >
            Resolver questões
          </Link>
        )}
        {podeCorrigir && (
          <Link
            href={`/temas/${id}/corrigir`}
            className="rounded border border-amber-400 bg-amber-50 px-4 py-2 text-sm text-amber-800 hover:bg-amber-100"
          >
            Corrigir erros
          </Link>
        )}
      </div>

      {(resumos ?? []).length === 0 && (
        <p className="text-sm text-neutral-500">Sem resumo cadastrado para este tema ainda.</p>
      )}

      {(resumos as Resumo[] | null)?.map((r) => (
        <article key={r.id} className="rounded-lg border border-neutral-200 bg-white p-4">
          {r.titulo && <h2 className="font-medium mb-2">{r.titulo}</h2>}
          <div className="prose prose-sm max-w-none prose-neutral">
            <ReactMarkdown>{r.conteudo_md ?? ""}</ReactMarkdown>
          </div>
          {r.pontos_decorar && r.pontos_decorar.length > 0 && (
            <div className="mt-3 rounded bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-xs font-medium text-yellow-800 mb-1">★ Decorar</p>
              <ul className="text-sm text-yellow-900 list-disc list-inside">
                {r.pontos_decorar.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </article>
      ))}

      {mostrarBotaoConcluir && <ResumoActions temaId={id} />}
    </div>
  );
}
