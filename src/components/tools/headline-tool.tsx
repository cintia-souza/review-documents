"use client";

import { useState, useTransition } from "react";
import { generatePremiumContent } from "@/actions/premium";

export function HeadlineTool() {
  const [targetRole, setTargetRole] = useState("");
  const [seniority, setSeniority] = useState("pleno");
  const [skills, setSkills] = useState("");
  const [result, setResult] = useState<{ headline: string; marketSkills: string[] } | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError("");
    setResult(null);
    startTransition(async () => {
      const context = `[CARGO-ALVO: ${targetRole}]\n[SENIORIDADE: ${seniority}]\n[COMPETÊNCIAS DO USUÁRIO: ${skills}]\n\nGere um headline otimizado para LinkedIn seguindo as regras. Também liste as 10 competências mais pedidas nas vagas de ${targetRole} ${seniority}.`;
      const res = await generatePremiumContent(context, "rewrite");
      if (res.success && res.data) {
        setResult({
          headline: res.data.optimizedHeadline ?? "",
          marketSkills: [],
        });
      } else {
        setError(res.error ?? "Erro ao gerar headline");
      }
    });
  };

  const canSubmit = targetRole.trim().length > 0 && skills.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hl-role" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Foco da vaga *
            </label>
            <input
              id="hl-role"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Ex: Front-end, Back-end, DevOps..."
              className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
          <div>
            <label htmlFor="hl-seniority" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Senioridade
            </label>
            <select
              id="hl-seniority"
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            >
              <option value="junior">Júnior / Entry-Level</option>
              <option value="pleno">Pleno / Mid-Level</option>
              <option value="senior">Sênior / Senior</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="hl-skills" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Suas competências técnicas *
          </label>
          <textarea
            id="hl-skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            rows={3}
            placeholder={"Ex: React, Next.js, TypeScript, CI/CD, AWS, Design Systems..."}
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
              Analisando mercado...
            </span>
          ) : (
            "🎯 Gerar Headline Otimizado"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="rounded-2xl border border-emerald-500/20 bg-zinc-900/80 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">Headline Sugerido</h3>
              <button
                onClick={() => navigator.clipboard.writeText(result.headline)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Copiar
              </button>
            </div>
            <p className="rounded-xl bg-zinc-800/50 p-4 text-sm font-medium text-white">
              {result.headline}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Baseado no cruzamento: vagas reais de {targetRole} ({seniority}) × suas competências
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
