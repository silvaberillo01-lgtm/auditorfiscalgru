import { requireAprovado } from "@/lib/auth";
import { getAnotacoesComTema, getTemas } from "@/lib/queries";
import AnotacoesList from "./anotacoes-list";

export default async function AnotacoesPage() {
  const { user } = await requireAprovado();
  const [anotacoes, temas] = await Promise.all([getAnotacoesComTema(user.id), getTemas()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-100">Anotações</h1>
      <AnotacoesList anotacoes={anotacoes} temas={temas} />
    </div>
  );
}
