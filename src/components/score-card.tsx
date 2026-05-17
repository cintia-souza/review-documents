"use client";

import { useEffect, useRef, useState } from "react";

interface ScoreCardProps {
  label: string;
  score: number;
  feedback: string;
  delay?: number;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "from-emerald-400 to-cyan-400";
  if (score >= 60) return "from-cyan-400 to-violet-400";
  return "from-rose-400 to-orange-400";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Regular";
  return "Precisa melhorar";
}

export function ScoreCard({ label, score, feedback, delay = 0 }: ScoreCardProps) {
  const gradient = getScoreColor(score);
  const [animated, setAnimated] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!animated) return;
    let current = 0;
    const step = score / 30;
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, 20);
    return () => clearInterval(interval);
  }, [animated, score]);

  return (
    <div
      ref={ref}
      role="article"
      aria-label={`${label}: ${score} de 100 — ${getScoreLabel(score)}`}
      className={`group relative rounded-2xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-sm transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.12)] ${
        animated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {/* Glow on hover */}
      <div
        className="absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 opacity-0 blur-sm transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
              {label}
            </h3>
            <p className="mt-0.5 text-xs text-zinc-600">{getScoreLabel(score)}</p>
          </div>
          <span
            className={`bg-gradient-to-r ${gradient} bg-clip-text text-4xl font-black tabular-nums text-transparent`}
          >
            {displayScore}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-zinc-800"
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso de ${label}`}
        >
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
            style={{ width: animated ? `${score}%` : "0%" }}
          />
        </div>

        {/* Feedback */}
        <p className="text-sm leading-relaxed text-zinc-300">{feedback}</p>
      </div>
    </div>
  );
}
