import Link from "next/link";
import { requireAprovado } from "@/lib/auth";
import { getTemas, getProgressoMap, fasesLabel } from "@/lib/queries";
import { FASE_BADGE } from "@/lib/fase-ui";

export default async function TemasPage() {
  const { user } = await requireAprovado();
  const [temas, progressoMap] = await Promise.all([getTemas(), getProgressoMap(user.id)]);

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
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3 shadow-sm hover:border-neutral-300"
              >
                <div>
                  <p className="font-medium">{tema.nome}</p>
                  <p className="text-xs text-neutral-500">
                    {tema.turno} · {tema.caderno} · peso {tema.peso}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${FASE_BADGE[fase]}`}>
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
