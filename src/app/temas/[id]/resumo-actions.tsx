"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { marcarResumoConcluidoAction } from "@/app/actions";

export default function ResumoActions({ temaId }: { temaId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await marcarResumoConcluidoAction(temaId);
          router.refresh();
        })
      }
      className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
    >
      {pending ? "Salvando..." : "Terminei o resumo"}
    </button>
  );
}
