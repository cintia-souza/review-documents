import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "ProfileAI — Análise Inteligente de Perfis",
  description:
    "Analise seu perfil profissional e currículo com IA. Receba recomendações baseadas nos 4 pilares do LinkedIn Recruiter.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "ProfileAI — Análise Inteligente de Perfis",
    description: "Descubra como se destacar para recrutadores com IA.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} min-h-screen antialiased`}>
        {/* Skip to content — acessibilidade para teclado */}
        <a
          href="#main-content"
          className="fixed left-2 top-2 z-[100] -translate-y-16 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0"
        >
          Pular para o conteúdo
        </a>

        {/* Background */}
        <div
          className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black"
          aria-hidden="true"
        />

        <div id="main-content">{children}</div>

        {/* Live region para anúncios de screen reader */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" id="announcer" />
      </body>
    </html>
  );
}
