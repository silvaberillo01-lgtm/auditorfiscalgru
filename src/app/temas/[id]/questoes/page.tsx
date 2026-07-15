import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAprovado } from "@/lib/auth";
import { getTema, getAnotacoesDoTema, getRespostasDoTema } from "@/lib/queries";
import type { Questao } from "@/lib/types";
import NotesPanel from "@/components/notes-panel";
import QuestoesTabs from "./questoes-tabs";

export default async function QuestoesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireAprovado();
  const tema = await getTema(id);
  if (!tema) notFound();

  const supabase = await createClient();
  const [{ data: questoes }, anotacoes, respostasSalvas] = await Promise.all([
    supabase.from("questoes").select("*").eq("tema_id", id),
    getAnotacoesDoTema(user.id, id),
    getRespostasDoTema(user.id, id),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-100">{tema.nome} — Questões</h1>

      <NotesPanel temaId={id} temaNome={tema.nome} anotacoes={anotacoes} />

      {(questoes ?? []).length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma questão cadastrada para este tema ainda.</p>
      ) : (
        <QuestoesTabs
          temaId={id}
          questoes={questoes as Questao[]}
          respostasSalvas={Object.fromEntries(respostasSalvas)}
        />
      )}
    </div>
  );
}
