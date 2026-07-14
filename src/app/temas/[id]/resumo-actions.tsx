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
        className="rounded-full bg-[#4E8FD9] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f7ac2] disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Terminei o resumo"}
      </button>
      <Toast info={toast} onDone={() => setToast(null)} />
    </>
  );
}
