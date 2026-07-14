import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAprovado } from "@/lib/auth";
import { getTema } from "@/lib/queries";
import CorrigirForm from "./corrigir-form";

export default async function CorrigirPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireAprovado();
  const tema = await getTema(id);
  if (!tema) notFound();

  const supabase = await createClient();
  const { data: questoes } = await supabase.from("questoes").select("id").eq("tema_id", id);
  const questaoIds = (questoes ?? []).map((q) => q.id);

  const { data: respostasErradas } = questaoIds.length
    ? await supabase
        .from("respostas")
        .select("id, resposta, questao_id, questoes(enunciado, gabarito, explicacao)")
        .eq("user_id", user.id)
        .in("questao_id", questaoIds)
        .eq("correta", false)
        .is("raciocinio", null)
    : { data: [] };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{tema.nome} — Corrigir erros</h1>
      {(respostasErradas ?? []).length === 0 && (
        <p className="text-sm text-neutral-500">Nenhum erro pendente de correção.</p>
      )}
      <div className="space-y-4">
        {(respostasErradas ?? []).map((r) => {
          const q = r.questoes as unknown as {
            enunciado: string;
            gabarito: string | null;
            explicacao: string | null;
          } | null;
          return (
            <CorrigirForm
              key={r.id}
              temaId={id}
              respostaId={r.id}
              enunciado={q?.enunciado ?? ""}
              gabarito={q?.gabarito ?? null}
              explicacao={q?.explicacao ?? null}
            />
          );
        })}
      </div>
    </div>
  );
}
