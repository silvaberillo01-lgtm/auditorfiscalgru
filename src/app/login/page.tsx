"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
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

  async function confirmarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: codigo,
      type: "email",
    });
    setPending(false);
    if (error) setErro(error.message);
    else router.replace("/");
  }

  return (
    <div className="max-w-sm mx-auto mt-12 space-y-4">
      <h1 className="text-xl font-semibold text-center text-neutral-100">Estudos — Auditor Fiscal VI</h1>
      {enviado ? (
        <div className="space-y-3">
          <p className="text-sm text-center text-neutral-400">
            Enviamos um código para <strong className="text-neutral-200">{email}</strong>. Se você instalou o
            app na tela de início, digite o código abaixo em vez de clicar no link — assim o login acontece
            sem sair do app.
          </p>
          <form onSubmit={confirmarCodigo} className="space-y-3">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Código de 6 dígitos"
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-lg tracking-widest text-neutral-100 placeholder:text-neutral-500"
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded bg-[#4E8FD9] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f7ac2] disabled:opacity-50"
            >
              {pending ? "Confirmando..." : "Confirmar código"}
            </button>
            {erro && <p className="text-sm text-red-400">{erro}</p>}
          </form>
          <button
            type="button"
            onClick={() => setEnviado(false)}
            className="w-full text-center text-xs text-neutral-500 hover:text-neutral-300"
          >
            Usar outro e-mail
          </button>
        </div>
      ) : (
        <form onSubmit={enviarLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-[#4E8FD9] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f7ac2] disabled:opacity-50"
          >
            {pending ? "Enviando..." : "Entrar"}
          </button>
          {erro && <p className="text-sm text-red-400">{erro}</p>}
        </form>
      )}
    </div>
  );
}
