import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ToolsNav } from "@/components/tools-nav";

export default async function PremiumPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Ferramentas de Otimização</h1>
            <p className="text-sm text-zinc-400">Otimize cada seção do seu perfil para o algoritmo do LinkedIn</p>
          </div>
        </div>
      </header>

      <ToolsNav />
    </main>
  );
}
