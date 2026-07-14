"use server";

import { revalidatePath } from "next/cache";
import { requireAprovadoAction } from "@/lib/auth";
import { getProgressoProva } from "@/lib/queries";
import * as engine from "@/lib/engine";

async function toastDeTransicao(userId: string, transicionou: boolean) {
  if (!transicionou) return null;
  const progresso = await getProgressoProva(userId);
  return { pct: progresso.pct, temasDominados: progresso.temasDominados, totalTemas: progresso.totalTemas };
}

export async function abrirResumoAction(temaId: string) {
  const { user } = await requireAprovadoAction();
  await engine.abrirResumo(user.id, temaId);
  revalidatePath("/");
  revalidatePath(`/temas/${temaId}`);
}

export async function marcarResumoConcluidoAction(temaId: string) {
  const { user } = await requireAprovadoAction();
  const transicionou = await engine.marcarResumoConcluido(user.id, temaId);
  revalidatePath("/");
  revalidatePath(`/temas/${temaId}`);
  return toastDeTransicao(user.id, transicionou);
}

export async function registrarRespostaAction(params: {
  temaId: string;
  questaoId: string;
  resposta: string;
  correta: boolean;
}) {
  const { user } = await requireAprovadoAction();
  const transicionou = await engine.registrarResposta({ userId: user.id, ...params });
  revalidatePath("/");
  revalidatePath(`/temas/${params.temaId}`);
  revalidatePath(`/temas/${params.temaId}/questoes`);
  return toastDeTransicao(user.id, transicionou);
}

export async function corrigirRespostaAction(params: {
  temaId: string;
  respostaId: string;
  raciocinio: string;
}) {
  const { user } = await requireAprovadoAction();
  const transicionou = await engine.corrigirResposta({ userId: user.id, ...params });
  revalidatePath("/");
  revalidatePath(`/temas/${params.temaId}`);
  revalidatePath(`/temas/${params.temaId}/corrigir`);
  return toastDeTransicao(user.id, transicionou);
}

export async function revisarFlashcardAction(params: {
  temaId: string;
  flashcardId: string;
  acertou: boolean;
}) {
  const { user } = await requireAprovadoAction();
  const transicionou = await engine.revisarFlashcard({ userId: user.id, ...params });
  revalidatePath("/");
  revalidatePath("/revisar");
  return toastDeTransicao(user.id, transicionou);
}

export async function salvarDuvidaAction(respostaId: string, duvida: string) {
  const { user, supabase } = await requireAprovadoAction();
  await supabase.from("respostas").update({ duvida }).eq("id", respostaId).eq("user_id", user.id);
  revalidatePath("/");
}

export async function criarAnotacaoAction(params: { temaId: string; titulo?: string; conteudo: string }) {
  const { user, supabase } = await requireAprovadoAction();
  const { error } = await supabase.from("anotacoes").insert({
    user_id: user.id,
    tema_id: params.temaId,
    titulo: params.titulo || null,
    conteudo_md: params.conteudo,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/temas/${params.temaId}`);
  revalidatePath(`/temas/${params.temaId}/questoes`);
  revalidatePath("/anotacoes");
}

export async function excluirAnotacaoAction(anotacaoId: string, temaId: string | null) {
  const { user, supabase } = await requireAprovadoAction();
  await supabase.from("anotacoes").delete().eq("id", anotacaoId).eq("user_id", user.id);
  if (temaId) {
    revalidatePath(`/temas/${temaId}`);
    revalidatePath(`/temas/${temaId}/questoes`);
  }
  revalidatePath("/anotacoes");
}
