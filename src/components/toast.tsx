"use client";

import { useEffect } from "react";

export type ToastInfo = { pct: number; temasDominados: number; totalTemas: number } | null;

export default function Toast({ info, onDone }: { info: ToastInfo; onDone: () => void }) {
  useEffect(() => {
    if (!info) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [info, onDone]);

  if (!info) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-[toast-in_0.25s_ease-out]">
      <div className="rounded-full bg-neutral-900 text-white text-sm px-4 py-2.5 shadow-lg whitespace-nowrap">
        🎉 Parabéns! Você já cobriu <strong>{info.pct}%</strong> da prova ({info.temasDominados}/
        {info.totalTemas} temas)
      </div>
    </div>
  );
}
