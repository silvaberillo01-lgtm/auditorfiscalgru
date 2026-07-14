import { requireAprovado } from "@/lib/auth";
import SenhaForm from "./senha-form";

export default async function ContaPage() {
  const { user } = await requireAprovado();

  return (
    <div className="max-w-sm mx-auto mt-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-100">Conta</h1>
        <p className="text-sm text-neutral-500">{user.email}</p>
      </div>
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-neutral-200">Definir senha</h2>
        <p className="text-sm text-neutral-400">
          Com uma senha definida, você pode entrar direto pelo e-mail e senha, sem precisar de um novo código
          por e-mail toda vez.
        </p>
        <SenhaForm />
      </div>
    </div>
  );
}
