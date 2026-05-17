import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <h1 className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-7xl">
          ProfileAI
        </h1>
        <p className="mx-auto max-w-md text-lg text-zinc-400">
          Análise inteligente do seu perfil profissional. Descubra como se destacar com recomendações personalizadas por IA.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-8 py-4 font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40"
        >
          Começar Análise Gratuita
        </Link>
      </div>
    </main>
  );
}
