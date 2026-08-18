import { createClient } from "@/lib/supabase/server";
import { requireAprovado } from "@/lib/auth";
import { getFlashcardsMaisErrados } from "@/lib/queries";
import { hojeISO } from "@/lib/prazo";
import FlashcardsErrosPanel from "@/components/flashcards-erros-panel";
import FlashcardQueue from "./flashcard-queue";

export default async function RevisarPage() {
  const { user } = await requireAprovado();
  const supabase = await createClient();
  const hoje = hojeISO();

  const flashcardsErrados = await getFlashcardsMaisErrados(user.id);

  const { data } = await supabase
    .from("flashcard_reviews")
    .select(
      "flashcard_id, proxima_revisao, anotacao, flashcards(id, tema_id, pergunta, resposta_html, temas(nome))"
    )
    .eq("user_id", user.id)
    .lte("proxima_revisao", hoje)
    .order("proxima_revisao", { ascending: true });

  const cards = (data ?? [])
    .map((r) => {
      const fc = r.flashcards as unknown as {
        id: string;
        tema_id: string;
        pergunta: string | null;
        resposta_html: string | null;
        temas: { nome: string } | null;
      } | null;
      if (!fc) return null;
      return {
        flashcard_id: fc.id,
        tema_id: fc.tema_id,
        tema_nome: fc.temas?.nome ?? fc.tema_id,
        pergunta: fc.pergunta ?? "",
        resposta_html: fc.resposta_html ?? "",
        anotacao: r.anotacao ?? null,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-100">Revisar</h1>
      <FlashcardQueue cards={cards} />
      <FlashcardsErrosPanel cards={flashcardsErrados} />
    </div>
  );
}
