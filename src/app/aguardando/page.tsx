import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";

export default async function AguardandoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("aprovado")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perfil?.aprovado) redirect("/");

  return (
    <div className="max-w-sm mx-auto mt-12 space-y-4 text-center">
      <h1 className="text-xl font-semibold">Aguardando liberação</h1>
      <p className="text-sm text-neutral-600">
        Sua conta ({user.email}) ainda não foi liberada. Peça pro admin aprovar seu acesso.
      </p>
      <LogoutButton />
    </div>
  );
}
