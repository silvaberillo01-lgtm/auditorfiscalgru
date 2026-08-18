import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAprovado } from "@/lib/auth";
import { getTema } from "@/lib/queries";
import { verificarConclusaoCorrecao } from "@/lib/engine";
import CopiarErrosBrutos from "@/components/copiar-erros-brutos";
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

  // se não sobrou erro pendente, libera o tema pro espaçamento em vez de
  // deixá-lo preso em "corrigindo"
  await verificarConclusaoCorrecao(user.id, id);

  const supabase = await createClient();
  const { data: questoes } = await supabase.from("questoes").select("id").eq("tema_id", id);
  const questaoIds = (questoes ?? []).map((q) => q.id);

  const { data: respostasErradas } = questaoIds.length
    ? await supabase
        .from("respostas")
        .select("id, resposta, questao_id, questoes(enunciado, alternativas, gabarito, explicacao)")
        .eq("user_id", user.id)
        .in("questao_id", questaoIds)
        .eq("correta", false)
        .is("raciocinio", null)
    : { data: [] };

  const questoesInfo = (respostasErradas ?? []).map((r) => {
    const q = r.questoes as unknown as {
      enunciado: string;
      alternativas: { letra: string; texto: string }[] | null;
      gabarito: string | null;
      explicacao: string | null;
    } | null;
    return {
      id: r.id,
      resposta: r.resposta as string | null,
      enunciado: q?.enunciado ?? "",
      alternativas: q?.alternativas ?? null,
      gabarito: q?.gabarito ?? null,
      explicacao: q?.explicacao ?? null,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-neutral-100">{tema.nome} — Corrigir erros</h1>
        <CopiarErrosBrutos temaNome={tema.nome} erros={questoesInfo} />
      </div>

      {questoesInfo.length === 0 && (
        <div className="rounded-2xl border border-[#5E9E6F33] bg-[#5E9E6F14] p-4 text-sm text-[#8ec49c]">
          Nenhum erro a corrigir aqui — tema liberado para a fase de{" "}
          <span className="font-semibold">espaçar</span>. Os flashcards entram na fila de revisão.{" "}
          <Link href="/revisar" className="underline">
            Ir para revisão
          </Link>
          .
        </div>
      )}

      {questoesInfo.length > 0 && (
        <p className="text-sm text-neutral-500">
          Dica: copie tudo pra uma IA debater antes de escrever seu raciocínio abaixo — às vezes o
          erro é falta de aprofundamento no tema, não só distração.
        </p>
      )}

      <div className="space-y-4">
        {questoesInfo.map((q) => (
          <CorrigirForm
            key={q.id}
            temaId={id}
            respostaId={q.id}
            enunciado={q.enunciado}
            gabarito={q.gabarito}
            explicacao={q.explicacao}
          />
        ))}
      </div>
    </div>
  );
}
