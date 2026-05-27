"use client";

import { useState, useTransition } from "react";
import { generatePremiumContent } from "@/actions/premium";

export function AboutTool() {
  const [targetRole, setTargetRole] = useState("");
  const [experienceTime, setExperienceTime] = useState("");
  const [skills, setSkills] = useState("");
  const [impact, setImpact] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError("");
    setResult("");
    startTransition(async () => {
      const context = `[CARGO-ALVO: ${targetRole}]\n[TEMPO DE EXPERIÊNCIA: ${experienceTime}]\n[COMPETÊNCIAS: ${skills}]\n[PROJETOS E RESULTADOS: ${impact}]`;
      const res = await generatePremiumContent(context, "about");
      if (res.success && res.data) {
        setResult(res.data.aboutRewrite);
      } else {
        setError(res.error ?? "Erro ao gerar Sobre");
      }
    });
  };

  const canSubmit = targetRole.trim().length > 0 && skills.trim().length > 0 && experienceTime.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ab-role" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Cargo / Especialidade *
            </label>
            <input
              id="ab-role"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Ex: Desenvolvedora Front-end"
              className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
          <div>
            <label htmlFor="ab-time" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Tempo de experiência *
            </label>
            <input
              id="ab-time"
              type="text"
              value={experienceTime}
              onChange={(e) => setExperienceTime(e.target.value)}
              placeholder="Ex: 4 anos, recém-formado..."
              className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
        </div>

        <div>
          <label htmlFor="ab-skills" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Competências técnicas *
          </label>
          <textarea
            id="ab-skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            rows={3}
            placeholder={"React, Next.js, TypeScript, CI/CD, AWS...\nDesign Systems, Testes, Docker..."}
            className="w-full resize-none rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>

        <div>
          <label htmlFor="ab-impact" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Projetos relevantes e resultados
          </label>
          <textarea
            id="ab-impact"
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
            rows={4}
            placeholder={"Conte sobre seus projetos e impacto:\n- Construí plataforma SaaS com +10K usuários\n- Reduzi deploy de 4h para 12min\n- Liderei time de 8 devs\n- Setores: energia solar, agronegócio, saúde"}
            className="w-full resize-none rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isPending || !canSubmit}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Gerando Sobre...
            </span>
          ) : (
            "✍️ Gerar Seção Sobre"
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-400">{error}</div>
      )}

      {result && (
        <div className="animate-fade-in-up rounded-2xl border border-cyan-500/20 bg-zinc-900/80 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-white">Seção Sobre</h3>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Copiar
            </button>
          </div>
          <p className="whitespace-pre-wrap rounded-xl bg-zinc-800/50 p-4 text-sm leading-relaxed text-zinc-300">
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
