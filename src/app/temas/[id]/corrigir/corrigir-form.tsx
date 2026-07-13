"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { corrigirRespostaAction } from "@/app/actions";

export default function CorrigirForm({
  temaId,
  respostaId,
  enunciado,
  gabarito,
  explicacao,
}: {
  temaId: string;
  respostaId: string;
  enunciado: string;
  gabarito: string | null;
  explicacao: string | null;
}) {
  const [raciocinio, setRaciocinio] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (enviado) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Correção salva.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
      <p className="font-medium">{enunciado}</p>
      {gabarito && <p className="text-sm text-neutral-600">Gabarito: {gabarito}</p>}
      {explicacao && <p className="text-sm text-neutral-600">{explicacao}</p>}
      <textarea
        value={raciocinio}
        onChange={(e) => setRaciocinio(e.target.value)}
        placeholder="Por que errei? O que preciso lembrar da próxima vez?"
        rows={3}
        className="w-full rounded border border-neutral-300 p-2 text-sm"
      />
      <button
        disabled={pending || raciocinio.trim().length === 0}
        onClick={() =>
          startTransition(async () => {
            await corrigirRespostaAction({ temaId, respostaId, raciocinio });
            setEnviado(true);
            router.refresh();
          })
        }
        className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        Salvar correção
      </button>
    </div>
  );
}
