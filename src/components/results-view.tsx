"use client";

import { ScoreCard } from "./score-card";
import type { AnalysisResult } from "@/types";

interface ResultsViewProps {
  result: AnalysisResult;
}

function getOverallGrade(score: number): { emoji: string; text: string } {
  if (score >= 90) return { emoji: "🏆", text: "Perfil Excepcional" };
  if (score >= 75) return { emoji: "🌟", text: "Perfil Forte" };
  if (score >= 60) return { emoji: "💪", text: "Bom Potencial" };
  if (score >= 40) return { emoji: "📈", text: "Em Desenvolvimento" };
  return { emoji: "🚀", text: "Grande Oportunidade de Melhoria" };
}

export function ResultsView({ result }: ResultsViewProps) {
  const { scores, feedback } = result;
  const grade = getOverallGrade(scores.overall);

  const cards: { label: string; score: number; feedback: string }[] = [
    { label: "Título", score: scores.title, feedback: feedback.title },
    { label: "Resumo", score: scores.summary, feedback: feedback.summary },
    { label: "Experiência", score: scores.experience, feedback: feedback.experience },
  ];

  return (
    <section aria-label="Resultados da análise" className="space-y-8">
      {/* Overall score hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 p-10 text-center backdrop-blur-sm">
        {/* Background decoration */}
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.08),transparent_60%)]"
          aria-hidden="true"
        />
        <div
          className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-violet-500/5 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <span className="text-4xl" role="img" aria-label={grade.text}>
            {grade.emoji}
          </span>
          <div className="mt-4">
            <span
              className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-7xl font-black tabular-nums text-transparent"
              aria-label={`Score geral: ${scores.overall} de 100`}
            >
              {scores.overall}
            </span>
            <span className="ml-1 text-lg text-zinc-600">/100</span>
          </div>
          <p className="mt-2 text-sm font-medium text-zinc-400">{grade.text}</p>

          {/* Mini stats */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xs text-zinc-500">Título</p>
              <p className="text-lg font-bold text-white">{scores.title}</p>
            </div>
            <div className="h-8 w-px bg-white/10" aria-hidden="true" />
            <div className="text-center">
              <p className="text-xs text-zinc-500">Resumo</p>
              <p className="text-lg font-bold text-white">{scores.summary}</p>
            </div>
            <div className="h-8 w-px bg-white/10" aria-hidden="true" />
            <div className="text-center">
              <p className="text-xs text-zinc-500">Experiência</p>
              <p className="text-lg font-bold text-white">{scores.experience}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score cards grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card, i) => (
          <ScoreCard key={card.label} {...card} delay={i * 150} />
        ))}
      </div>

      {/* Tips section */}
      <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <span className="text-lg" role="img" aria-label="Dicas">
              💡
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Plano de Ação
            </h3>
            <p className="text-xs text-zinc-500">
              Siga estas dicas para melhorar seu score
            </p>
          </div>
        </div>

        <ul className="space-y-4" role="list" aria-label="Lista de dicas">
          {feedback.tips.map((tip, i) => (
            <li
              key={i}
              className="group flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-white/[0.02]"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 text-xs font-bold text-white shadow-sm shadow-cyan-500/20"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-zinc-300 group-hover:text-zinc-200">
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Export actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          aria-label="Exportar análise como PDF"
          className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300 transition-all hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Exportar PDF
        </button>
        <button
          aria-label="Compartilhar resultado no LinkedIn"
          className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300 transition-all hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Compartilhar
        </button>
      </div>
    </section>
  );
}
