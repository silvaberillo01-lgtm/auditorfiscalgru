"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import * as engine from "@/lib/engine";

export async function abrirResumoAction(temaId: string) {
  await engine.abrirResumo(temaId);
  revalidatePath("/");
  revalidatePath(`/temas/${temaId}`);
}

export async function marcarResumoConcluidoAction(temaId: string) {
  await engine.marcarResumoConcluido(temaId);
  revalidatePath("/");
  revalidatePath(`/temas/${temaId}`);
}

export async function registrarRespostaAction(params: {
  temaId: string;
  questaoId: string;
  resposta: string;
  correta: boolean;
}) {
  await engine.registrarResposta(params);
  revalidatePath("/");
  revalidatePath(`/temas/${params.temaId}`);
  revalidatePath(`/temas/${params.temaId}/questoes`);
}

export async function corrigirRespostaAction(params: {
  temaId: string;
  respostaId: string;
  raciocinio: string;
}) {
  await engine.corrigirResposta(params);
  revalidatePath("/");
  revalidatePath(`/temas/${params.temaId}`);
  revalidatePath(`/temas/${params.temaId}/corrigir`);
}

export async function revisarFlashcardAction(params: {
  temaId: string;
  flashcardId: string;
  acertou: boolean;
}) {
  await engine.revisarFlashcard(params);
  revalidatePath("/");
  revalidatePath("/revisar");
}

export async function salvarDuvidaAction(respostaId: string, duvida: string) {
  await supabase.from("respostas").update({ duvida }).eq("id", respostaId);
  revalidatePath("/");
}
