import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Fase } from "@/lib/types";

const SEQUENCIA_INTERVALOS = [1, 3, 7, 15, 30, 60];

function proximoIntervalo(atual: number) {
  const idx = SEQUENCIA_INTERVALOS.indexOf(atual);
  if (idx === -1) return Math.min(atual * 2, 60);
  return SEQUENCIA_INTERVALOS[Math.min(idx + 1, SEQUENCIA_INTERVALOS.length - 1)];
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

async function garantirProgresso(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  temaId: string
) {
  const { data } = await supabase
    .from("tema_progresso")
    .select("*")
    .eq("user_id", userId)
    .eq("tema_id", temaId)
    .maybeSingle();
  if (data) return data;
  const { data: criado } = await supabase
    .from("tema_progresso")
    .insert({ user_id: userId, tema_id: temaId, fase: "nao_iniciado" as Fase })
    .select("*")
    .single();
  return criado!;
}

async function registrarAtividade(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  acoes = 1
) {
  const data = hojeISO();
  const { data: existente } = await supabase
    .from("atividade_diaria")
    .select("*")
    .eq("user_id", userId)
    .eq("data", data)
    .maybeSingle();
  if (existente) {
    await supabase
      .from("atividade_diaria")
      .update({ acoes: existente.acoes + acoes })
      .eq("user_id", userId)
      .eq("data", data);
  } else {
    await supabase.from("atividade_diaria").insert({ user_id: userId, data, acoes });
  }
}

/** Abriu a página de resumo do tema pela primeira vez. */
export async function abrirResumo(userId: string, temaId: string) {
  const supabase = await createClient();
  const progresso = await garantirProgresso(supabase, userId, temaId);
  if (progresso.fase === "nao_iniciado") {
    await supabase
      .from("tema_progresso")
      .update({ fase: "entendendo" satisfies Fase })
      .eq("user_id", userId)
      .eq("tema_id", temaId);
  }
}

/** Botão explícito "terminei o resumo". Retorna true (sempre transiciona). */
export async function marcarResumoConcluido(userId: string, temaId: string): Promise<boolean> {
  const supabase = await createClient();
  await garantirProgresso(supabase, userId, temaId);
  await supabase
    .from("tema_progresso")
    .update({ fase: "testando" satisfies Fase, entendido_em: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("tema_id", temaId);
  await registrarAtividade(supabase, userId);
  return true;
}

/** Grava a resposta de uma questão. Retorna true se o tema virou "corrigindo" agora. */
export async function registrarResposta(params: {
  userId: string;
  temaId: string;
  questaoId: string;
  resposta: string;
  correta: boolean;
}): Promise<boolean> {
  const { userId, temaId, questaoId, resposta, correta } = params;
  const supabase = await createClient();

  await supabase.from("respostas").insert({
    user_id: userId,
    questao_id: questaoId,
    resposta,
    correta,
  });
  await registrarAtividade(supabase, userId);

  const progresso = await garantirProgresso(supabase, userId, temaId);
  if (progresso.fase !== "testando") return false;

  const { data: questoes } = await supabase
    .from("questoes")
    .select("id")
    .eq("tema_id", temaId);
  const totalQuestoes = questoes?.length ?? 0;
  if (totalQuestoes === 0) return false;

  const { data: respostas } = await supabase
    .from("respostas")
    .select("questao_id, correta, respondida_em")
    .eq("user_id", userId)
    .in("questao_id", questoes!.map((q) => q.id))
    .order("respondida_em", { ascending: false });

  // última resposta por questão
  const ultimaPorQuestao = new Map<string, boolean>();
  for (const r of respostas ?? []) {
    if (!ultimaPorQuestao.has(r.questao_id)) {
      ultimaPorQuestao.set(r.questao_id, !!r.correta);
    }
  }

  if (ultimaPorQuestao.size < totalQuestoes) return false; // ainda falta responder alguma

  const acertos = [...ultimaPorQuestao.values()].filter(Boolean).length;
  const pct = (acertos / totalQuestoes) * 100;

  await supabase
    .from("tema_progresso")
    .update({
      fase: "corrigindo" satisfies Fase,
      testado_em: new Date().toISOString(),
      pct_acerto: pct,
    })
    .eq("user_id", userId)
    .eq("tema_id", temaId);
  return true;
}

/** Preenche o raciocínio de uma resposta errada. Retorna true se virou "espacando" agora. */
export async function corrigirResposta(params: {
  userId: string;
  temaId: string;
  respostaId: string;
  raciocinio: string;
}): Promise<boolean> {
  const { userId, temaId, respostaId, raciocinio } = params;
  const supabase = await createClient();

  await supabase
    .from("respostas")
    .update({ raciocinio })
    .eq("id", respostaId)
    .eq("user_id", userId);
  await registrarAtividade(supabase, userId);

  const progresso = await garantirProgresso(supabase, userId, temaId);
  if (progresso.fase !== "corrigindo") return false;

  const { data: questoes } = await supabase
    .from("questoes")
    .select("id")
    .eq("tema_id", temaId);

  const { data: errosSemRaciocinio } = await supabase
    .from("respostas")
    .select("id")
    .eq("user_id", userId)
    .in("questao_id", (questoes ?? []).map((q) => q.id))
    .eq("correta", false)
    .is("raciocinio", null);

  if ((errosSemRaciocinio?.length ?? 0) > 0) return false;

  await supabase
    .from("tema_progresso")
    .update({ fase: "espacando" satisfies Fase, corrigido_em: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("tema_id", temaId);

  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("id")
    .eq("tema_id", temaId);

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const amanhaISO = amanha.toISOString().slice(0, 10);

  for (const fc of flashcards ?? []) {
    const { data: existente } = await supabase
      .from("flashcard_reviews")
      .select("flashcard_id")
      .eq("user_id", userId)
      .eq("flashcard_id", fc.id)
      .maybeSingle();
    if (!existente) {
      await supabase.from("flashcard_reviews").insert({
        user_id: userId,
        flashcard_id: fc.id,
        intervalo_dias: 1,
        proxima_revisao: amanhaISO,
      });
    }
  }
  return true;
}

/** Leitner simplificado: acertou dobra o intervalo (na sequência), errou volta pra 1. Retorna true se virou "dominado" agora. */
export async function revisarFlashcard(params: {
  userId: string;
  temaId: string;
  flashcardId: string;
  acertou: boolean;
}): Promise<boolean> {
  const { userId, temaId, flashcardId, acertou } = params;
  const supabase = await createClient();

  const { data: review } = await supabase
    .from("flashcard_reviews")
    .select("*")
    .eq("user_id", userId)
    .eq("flashcard_id", flashcardId)
    .single();
  if (!review) return false;

  const hoje = hojeISO();
  let novoIntervalo: number;
  let novoStreak: number;
  let novosCiclos = review.ciclos_completos ?? 0;

  if (acertou) {
    novoIntervalo = proximoIntervalo(review.intervalo_dias);
    novoStreak = review.streak_acertos + 1;
    if (novoIntervalo === 30) novosCiclos += 1;
  } else {
    novoIntervalo = 1;
    novoStreak = 0;
  }

  const proxima = new Date();
  proxima.setDate(proxima.getDate() + novoIntervalo);

  await supabase
    .from("flashcard_reviews")
    .update({
      intervalo_dias: novoIntervalo,
      proxima_revisao: proxima.toISOString().slice(0, 10),
      ultima_revisao: hoje,
      streak_acertos: novoStreak,
      ciclos_completos: novosCiclos,
    })
    .eq("user_id", userId)
    .eq("flashcard_id", flashcardId);

  await registrarAtividade(supabase, userId);

  // espacando -> dominado: todos os cards do tema com 2+ ciclos completos (D+15 e D+30 sem erro)
  const { data: todosCards } = await supabase
    .from("flashcards")
    .select("id")
    .eq("tema_id", temaId);
  if (!todosCards || todosCards.length === 0) return false;

  const { data: todasReviews } = await supabase
    .from("flashcard_reviews")
    .select("flashcard_id, ciclos_completos")
    .eq("user_id", userId)
    .in("flashcard_id", todosCards.map((c) => c.id));

  const dominado =
    (todasReviews?.length ?? 0) === todosCards.length &&
    todasReviews!.every((r) => (r.ciclos_completos ?? 0) >= 2);

  if (dominado) {
    await supabase
      .from("tema_progresso")
      .update({ fase: "dominado" satisfies Fase })
      .eq("user_id", userId)
      .eq("tema_id", temaId);
  }
  return dominado;
}
