"use client";

import { useState, useTransition } from "react";
import { UploadZone } from "@/components/upload-zone";
import { analyzeProfile } from "@/actions/analyze";
import { ResultsView } from "@/components/results-view";
import { HistoryList } from "@/components/history-list";
import type { AnalysisResult, ProfileScores } from "@/types";

interface DashboardClientProps {
  userName: string | null | undefined;
  userPlan: "FREE" | "PREMIUM";
  history: {
    id: string;
    source: string;
    input: string;
    scores: ProfileScores;
    createdAt: string;
  }[];
}

export function DashboardClient({
  userName,
  userPlan,
  history,
}: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = (formData: FormData) => {
    setError("");
    startTransition(async () => {
      const response = await analyzeProfile(formData);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error ?? "Erro ao analisar perfil");
      }
    });
  };

  const greeting = getGreeting();
  const firstName = userName?.split(" ")[0] ?? "Usuário";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-10">
        {/* Welcome section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {greeting}, {firstName} 👋
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Analise e otimize seu perfil profissional com IA
            </p>
          </div>
          {userPlan === "PREMIUM" ? (
            <a
              href="/premium"
              className="animate-glow inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 px-4 py-2 text-xs font-medium text-cyan-300 transition-all hover:from-cyan-500/30 hover:to-violet-500/30"
            >
              ✨ Ferramentas IA
            </a>
          ) : (
            <a
              href="/premium"
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-cyan-500/30 hover:text-cyan-400"
            >
              Upgrade para Premium →
            </a>
          )}
        </div>

        {/* Stats */}
        <div
          className="grid gap-4 sm:grid-cols-3"
          role="region"
          aria-label="Estatísticas"
        >
          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10">
              <svg
                className="h-4 w-4 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{history.length}</p>
            <p className="text-xs text-zinc-500">Análises realizadas</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <svg
                className="h-4 w-4 text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {history.length > 0
                ? Math.max(...history.map((h) => h.scores.overall))
                : "—"}
            </p>
            <p className="text-xs text-zinc-500">Melhor score</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <svg
                className="h-4 w-4 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {history.length > 0
                ? new Date(history[0].createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })
                : "—"}
            </p>
            <p className="text-xs text-zinc-500">Última análise</p>
          </div>
        </div>

        {/* Main content */}
        {!result ? (
          <div className="space-y-10">
            {/* Upload section */}
            <section aria-label="Nova análise">
              <div className="mb-6 text-center">
                <h2 className="text-lg font-semibold text-white">
                  Nova Análise
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Cole a URL do LinkedIn ou envie seu currículo em PDF
                </p>
              </div>
              <UploadZone onSubmit={handleSubmit} isLoading={isPending} />
              {error && (
                <p
                  role="alert"
                  className="mt-4 text-center text-sm text-rose-400"
                >
                  {error}
                </p>
              )}
            </section>

            {/* History */}
            <HistoryList items={history} />
          </div>
        ) : (
          <div className="space-y-6">
            <ResultsView result={result} />
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setResult(null)}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm text-zinc-300 transition-all hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                ← Nova Análise
              </button>
              {userPlan === "FREE" ? (
                <a
                  href="/premium"
                  className="animate-glow rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  ✨ Desbloquear Recursos Premium
                </a>
              ) : (
                <a
                  href="/premium"
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  ✨ Usar Ferramentas Premium
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
