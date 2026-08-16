import Link from "next/link";
import { requireAprovado } from "@/lib/auth";
import { getSimulados } from "@/lib/queries";

export const metadata = { title: "Simulados — Estudos AF VI" };

export default async function SimuladosPage() {
  const { user } = await requireAprovado();
  const simulados = await getSimulados(user.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-100">Simulados</h1>
        <p className="text-sm text-neutral-400">
          Provas avulsas no formato IBAM pra treinar em dupla: cada um responde no
          próprio login, sem feedback imediato, e o gabarito comentado sai no final.
          Nada aqui mexe no andamento do caderno de questões normal.
        </p>
      </div>

      {simulados === null ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
          As tabelas de simulado ainda não existem no banco. Rode o{" "}
          <code className="text-neutral-200">supabase/schema.sql</code> atualizado no SQL
          Editor do Supabase e depois{" "}
          <code className="text-neutral-200">npx tsx scripts/seed-simulado.ts</code>.
        </div>
      ) : simulados.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Nenhum simulado cadastrado ainda — rode{" "}
          <code className="text-neutral-300">npx tsx scripts/seed-simulado.ts</code>.
        </p>
      ) : (
        <ul className="space-y-3">
          {simulados.map((s) => {
            const completo = s.totalQuestoes > 0 && s.respondidas >= s.totalQuestoes;
            return (
              <li key={s.id}>
                <Link
                  href={`/simulado/${s.id}`}
                  className="block rounded-2xl border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-700 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-neutral-100">{s.titulo}</p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        completo
                          ? "bg-[#5E9E6F1a] text-[#8ec49c]"
                          : s.respondidas > 0
                            ? "bg-[#D9A44E1a] text-[#e3c084]"
                            : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {completo
                        ? "Completo — conferir gabarito"
                        : `${s.respondidas}/${s.totalQuestoes}`}
                    </span>
                  </div>
                  {s.descricao && (
                    <p className="mt-1 text-sm text-neutral-400">{s.descricao}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
