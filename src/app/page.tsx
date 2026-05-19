import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl space-y-8">
        {/* Logo */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 shadow-lg shadow-cyan-500/20">
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <h1 className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-7xl">
          ProfileAI
        </h1>

        <p className="mx-auto max-w-lg text-lg leading-relaxed text-zinc-400">
          Análise inteligente do seu perfil profissional baseada nos{" "}
          <strong className="text-zinc-200">4 pilares do LinkedIn Recruiter</strong>.
          Descubra como se destacar com recomendações personalizadas por IA.
        </p>

        {/* Features */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-500">
          <span className="rounded-full border border-white/10 px-3 py-1">Skill Graph</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Metodologia CHA</span>
          <span className="rounded-full border border-white/10 px-3 py-1">NER + TF-IDF</span>
          <span className="rounded-full border border-white/10 px-3 py-1">LinkedIn Recruiter</span>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-8 py-4 font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Começar Análise Gratuita
          </Link>
          <Link
            href="/login"
            className="text-sm text-zinc-400 underline-offset-4 transition-colors hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </main>
  );
}
