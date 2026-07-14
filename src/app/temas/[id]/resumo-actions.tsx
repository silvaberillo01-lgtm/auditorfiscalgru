"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { marcarResumoConcluidoAction } from "@/app/actions";
import Toast, { type ToastInfo } from "@/components/toast";

export default function ResumoActions({ temaId }: { temaId: string }) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastInfo>(null);
  const router = useRouter();

  return (
    <>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const resultado = await marcarResumoConcluidoAction(temaId);
            if (resultado) setToast(resultado);
            router.refresh();
          })
        }
        className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Terminei o resumo"}
      </button>
      <Toast info={toast} onDone={() => setToast(null)} />
    </>
  );
}
