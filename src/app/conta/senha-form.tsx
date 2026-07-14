"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function SenhaForm() {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [pending, setPending] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não conferem.");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setPending(false);
    if (error) setErro(error.message);
    else {
      setSucesso(true);
      setSenha("");
      setConfirmacao("");
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-3">
      <input
        type="password"
        required
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="Nova senha"
        className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
      />
      <input
        type="password"
        required
        value={confirmacao}
        onChange={(e) => setConfirmacao(e.target.value)}
        placeholder="Confirmar senha"
        className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-[#4E8FD9] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f7ac2] disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Salvar senha"}
      </button>
      {erro && <p className="text-sm text-red-400">{erro}</p>}
      {sucesso && <p className="text-sm text-green-400">Senha salva. Já pode usar da próxima vez.</p>}
    </form>
  );
}
