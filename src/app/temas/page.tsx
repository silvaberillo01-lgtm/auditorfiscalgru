import Link from "next/link";
import { getTemas, getProgressoMap, fasesLabel } from "@/lib/queries";
import type { Fase } from "@/lib/types";

const FASE_COR: Record<Fase, string> = {
  nao_iniciado: "bg-neutral-100 text-neutral-600",
  entendendo: "bg-sky-100 text-sky-700",
  testando: "bg-violet-100 text-violet-700",
  corrigindo: "bg-amber-100 text-amber-700",
  espacando: "bg-emerald-100 text-emerald-700",
  dominado: "bg-green-600 text-white",
};

export default async function TemasPage() {
  const [temas, progressoMap] = await Promise.all([getTemas(), getProgressoMap()]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Temas</h1>
      <ul className="space-y-2">
        {temas.map((tema) => {
          const fase = progressoMap.get(tema.id)?.fase ?? "nao_iniciado";
          return (
            <li key={tema.id}>
              <Link
                href={`/temas/${tema.id}`}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 hover:border-neutral-300"
              >
                <div>
                  <p className="font-medium">{tema.nome}</p>
                  <p className="text-xs text-neutral-500">
                    {tema.turno} · {tema.caderno} · peso {tema.peso}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${FASE_COR[fase]}`}>
                  {fasesLabel(fase)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
