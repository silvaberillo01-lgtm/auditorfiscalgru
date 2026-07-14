"use server";

import { revalidatePath } from "next/cache";
import { requireAprovadoAction } from "@/lib/auth";
import * as engine from "@/lib/engine";

export async function abrirResumoAction(temaId: string) {
  const { user } = await requireAprovadoAction();
  await engine.abrirResumo(user.id, temaId);
  revalidatePath("/");
  revalidatePath(`/temas/${temaId}`);
}

export async function marcarResumoConcluidoAction(temaId: string) {
  const { user } = await requireAprovadoAction();
  await engine.marcarResumoConcluido(user.id, temaId);
  revalidatePath("/");
  revalidatePath(`/temas/${temaId}`);
}

export async function registrarRespostaAction(params: {
  temaId: string;
  questaoId: string;
  resposta: string;
  correta: boolean;
}) {
  const { user } = await requireAprovadoAction();
  await engine.registrarResposta({ userId: user.id, ...params });
  revalidatePath("/");
  revalidatePath(`/temas/${params.temaId}`);
  revalidatePath(`/temas/${params.temaId}/questoes`);
}

export async function corrigirRespostaAction(params: {
  temaId: string;
  respostaId: string;
  raciocinio: string;
}) {
  const { user } = await requireAprovadoAction();
  await engine.corrigirResposta({ userId: user.id, ...params });
  revalidatePath("/");
  revalidatePath(`/temas/${params.temaId}`);
  revalidatePath(`/temas/${params.temaId}/corrigir`);
}

export async function revisarFlashcardAction(params: {
  temaId: string;
  flashcardId: string;
  acertou: boolean;
}) {
  const { user } = await requireAprovadoAction();
  await engine.revisarFlashcard({ userId: user.id, ...params });
  revalidatePath("/");
  revalidatePath("/revisar");
}

export async function salvarDuvidaAction(respostaId: string, duvida: string) {
  const { user, supabase } = await requireAprovadoAction();
  await supabase.from("respostas").update({ duvida }).eq("id", respostaId).eq("user_id", user.id);
  revalidatePath("/");
}
