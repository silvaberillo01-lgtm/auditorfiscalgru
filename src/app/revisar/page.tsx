import { supabase } from "@/lib/supabase";
import FlashcardQueue from "./flashcard-queue";

export default async function RevisarPage() {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("flashcard_reviews")
    .select("flashcard_id, proxima_revisao, flashcards(id, tema_id, pergunta, resposta_html, temas(nome))")
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
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Revisar</h1>
      <FlashcardQueue cards={cards} />
    </div>
  );
}
