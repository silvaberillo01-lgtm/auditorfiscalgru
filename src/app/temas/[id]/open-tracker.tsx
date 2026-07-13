"use client";

import { useEffect } from "react";
import { abrirResumoAction } from "@/app/actions";

/** Dispara "abriu o resumo" (nao_iniciado -> entendendo) uma vez, no client. */
export default function OpenTracker({ temaId }: { temaId: string }) {
  useEffect(() => {
    abrirResumoAction(temaId);
  }, [temaId]);
  return null;
}
