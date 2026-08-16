import { notFound } from "next/navigation";
import { requireAprovado } from "@/lib/auth";
import { getSimuladoCompleto } from "@/lib/queries";
import SimuladoRunner from "./simulado-runner";

export default async function SimuladoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireAprovado();
  const dados = await getSimuladoCompleto(user.id, id);
  if (!dados) notFound();

  const { simulado, questoes, respostas, temaNomes } = dados;

  return (
    <SimuladoRunner
      simulado={simulado}
      questoes={questoes}
      respostasSalvas={Object.fromEntries(respostas)}
      temaNomes={Object.fromEntries(temaNomes)}
    />
  );
}
