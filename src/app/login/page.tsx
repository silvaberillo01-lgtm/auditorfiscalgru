"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type Modo = "senha" | "codigo";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("senha");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function entrarComSenha(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setPending(false);
    if (error) setErro(error.message);
    else router.replace("/");
  }

  async function enviarCodigo(e: React.FormEvent) {
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

  function trocarModo(novoModo: Modo) {
    setModo(novoModo);
    setEnviado(false);
    setErro(null);
  }

  return (
    <div className="max-w-sm mx-auto mt-12 space-y-4">
      <h1 className="text-xl font-semibold text-center text-neutral-100">Estudos — Auditor Fiscal VI</h1>

      {modo === "senha" && (
        <form onSubmit={entrarComSenha} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
          />
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            autoComplete="current-password"
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-[#4E8FD9] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f7ac2] disabled:opacity-50"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
          {erro && <p className="text-sm text-red-400">{erro}</p>}
          <button
            type="button"
            onClick={() => trocarModo("codigo")}
            className="w-full text-center text-xs text-neutral-500 hover:text-neutral-300"
          >
            Ainda não tenho senha / esqueci a senha
          </button>
        </form>
      )}

      {modo === "codigo" && !enviado && (
        <form onSubmit={enviarCodigo} className="space-y-3">
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
            {pending ? "Enviando..." : "Enviar código por e-mail"}
          </button>
          {erro && <p className="text-sm text-red-400">{erro}</p>}
          <button
            type="button"
            onClick={() => trocarModo("senha")}
            className="w-full text-center text-xs text-neutral-500 hover:text-neutral-300"
          >
            Já tenho senha
          </button>
        </form>
      )}

      {modo === "codigo" && enviado && (
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
          <p className="text-center text-xs text-neutral-500">
            Depois de entrar, defina uma senha em <span className="text-neutral-400">Conta</span> pra não
            precisar de código nas próximas vezes.
          </p>
        </div>
      )}
    </div>
  );
}
