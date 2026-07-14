import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAprovado } from "@/lib/auth";
import { getTema } from "@/lib/queries";
import type { Questao } from "@/lib/types";
import QuestaoForm from "./questao-form";

export default async function QuestoesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAprovado();
  const tema = await getTema(id);
  if (!tema) notFound();

  const supabase = await createClient();
  const { data: questoes } = await supabase
    .from("questoes")
    .select("*")
    .eq("tema_id", id);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{tema.nome} — Questões</h1>
      {(questoes ?? []).length === 0 && (
        <p className="text-sm text-neutral-500">Nenhuma questão cadastrada para este tema ainda.</p>
      )}
      <div className="space-y-4">
        {(questoes as Questao[] | null)?.map((q) => (
          <QuestaoForm key={q.id} temaId={id} questao={q} />
        ))}
      </div>
    </div>
  );
}
