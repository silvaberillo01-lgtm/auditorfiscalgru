import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";
import RegisterSW from "@/components/register-sw";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Estudos — Auditor Fiscal VI",
  description: "App pessoal de estudos para o concurso de Auditor Fiscal VI (Guarulhos/IBAM)",
  manifest: "/manifest.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <RegisterSW />
        {user && (
          <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur">
            <nav className="max-w-3xl mx-auto flex items-center gap-5 overflow-x-auto whitespace-nowrap px-4 py-3 text-sm">
              <Link href="/" className="shrink-0 font-semibold text-neutral-100">
                Hoje
              </Link>
              <Link href="/plano" className="shrink-0 text-neutral-400 hover:text-neutral-100">
                Plano
              </Link>
              <Link href="/temas" className="shrink-0 text-neutral-400 hover:text-neutral-100">
                Temas
              </Link>
              <Link href="/revisar" className="shrink-0 text-neutral-400 hover:text-neutral-100">
                Revisar
              </Link>
              <Link href="/simulado" className="shrink-0 text-neutral-400 hover:text-neutral-100">
                Simulado
              </Link>
              <Link href="/anotacoes" className="shrink-0 text-neutral-400 hover:text-neutral-100">
                Anotações
              </Link>
              <Link href="/principios" className="shrink-0 text-neutral-400 hover:text-neutral-100">
                Princípios
              </Link>
              <span className="flex-1" />
              <Link href="/conta" className="shrink-0 text-neutral-400 hover:text-neutral-100">
                Conta
              </Link>
              <span className="hidden shrink-0 text-xs text-neutral-500 sm:inline">{user.email}</span>
              <LogoutButton />
            </nav>
          </header>
        )}
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
