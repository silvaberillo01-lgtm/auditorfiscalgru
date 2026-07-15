"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { esquecerRespostasAction } from "@/app/actions";

export default function EsquecerButton({ temaId, temaNome }: { temaId: string; temaNome: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() => {
        const ok = window.confirm(
          `Apagar todas as suas respostas de "${temaNome}" e recomeçar as questões do zero? Isso não afeta seus flashcards.`
        );
        if (!ok) return;
        startTransition(async () => {
          await esquecerRespostasAction(temaId);
          router.refresh();
        });
      }}
      className="text-xs text-neutral-500 hover:text-[#ef8880] underline disabled:opacity-50"
    >
      {pending ? "Apagando..." : "Esquecer respostas e recomeçar"}
    </button>
  );
}
