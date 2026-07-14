"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { corrigirRespostaAction } from "@/app/actions";
import Toast, { type ToastInfo } from "@/components/toast";

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
  const [toast, setToast] = useState<ToastInfo>(null);
  const router = useRouter();

  if (enviado) {
    return (
      <>
        <div className="rounded-2xl border border-[#5E9E6F33] bg-[#5E9E6F14] p-4 text-sm text-[#8ec49c]">
          Correção salva.
        </div>
        <Toast info={toast} onDone={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-3">
      <Toast info={toast} onDone={() => setToast(null)} />
      <p className="font-medium text-neutral-100">{enunciado}</p>
      {gabarito && <p className="text-sm text-neutral-400">Gabarito: {gabarito}</p>}
      {explicacao && <p className="text-sm text-neutral-400">{explicacao}</p>}
      <textarea
        value={raciocinio}
        onChange={(e) => setRaciocinio(e.target.value)}
        placeholder="Por que errei? O que preciso lembrar da próxima vez?"
        rows={3}
        className="w-full rounded border border-neutral-700 bg-neutral-950 p-2 text-sm text-neutral-100 placeholder:text-neutral-500"
      />
      <button
        disabled={pending || raciocinio.trim().length === 0}
        onClick={() =>
          startTransition(async () => {
            const resultado = await corrigirRespostaAction({ temaId, respostaId, raciocinio });
            if (resultado) setToast(resultado);
            setEnviado(true);
            router.refresh();
          })
        }
        className="rounded-full bg-[#E2574C] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        Salvar correção
      </button>
    </div>
  );
}
