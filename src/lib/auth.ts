import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Garante usuário autenticado e aprovado; senão redireciona. Use no topo de páginas protegidas. */
export async function requireAprovado() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!perfil?.aprovado) redirect("/aguardando");

  return { user, perfil, supabase };
}

/** Versão para Server Actions: lança erro em vez de redirecionar. */
export async function requireAprovadoAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!perfil?.aprovado) throw new Error("Conta não aprovada.");

  return { user, perfil, supabase };
}
