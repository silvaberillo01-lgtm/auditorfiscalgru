"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function enviarLink(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setPending(false);
    if (error) setErro(error.message);
    else setEnviado(true);
  }

  return (
    <div className="max-w-sm mx-auto mt-12 space-y-4">
      <h1 className="text-xl font-semibold text-center">Estudos — Auditor Fiscal VI</h1>
      {enviado ? (
        <p className="text-sm text-center text-neutral-600">
          Link de acesso enviado para <strong>{email}</strong>. Confira sua caixa de entrada.
        </p>
      ) : (
        <form onSubmit={enviarLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {pending ? "Enviando..." : "Entrar com link mágico"}
          </button>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
        </form>
      )}
    </div>
  );
}
