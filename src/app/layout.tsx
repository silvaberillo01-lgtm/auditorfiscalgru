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
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <RegisterSW />
        {user && (
          <header className="border-b border-neutral-200 bg-white">
            <nav className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-3 text-sm">
              <Link href="/" className="font-semibold text-neutral-900">
                Hoje
              </Link>
              <Link href="/temas" className="text-neutral-600 hover:text-neutral-900">
                Temas
              </Link>
              <Link href="/revisar" className="text-neutral-600 hover:text-neutral-900">
                Revisar
              </Link>
              <span className="flex-1" />
              <span className="text-xs text-neutral-400">{user.email}</span>
              <LogoutButton />
            </nav>
          </header>
        )}
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
