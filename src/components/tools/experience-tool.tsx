"use client";

import { useState, useTransition } from "react";
import { generatePremiumContent } from "@/actions/premium";

function normalizeExp(exp: unknown): string {
  if (typeof exp === "string") return exp;
  if (typeof exp === "object" && exp !== null) {
    const obj = exp as Record<string, unknown>;
    const parts = [];
    if (obj.cargo) parts.push(String(obj.cargo));
    if (obj.empresa) parts.push(`em ${String(obj.empresa)}`);
    if (obj.descricao) parts.push(`— ${String(obj.descricao)}`);
    if (parts.length > 0) return parts.join(" ");
    return Object.values(obj).map(String).join(" | ");
  }
  return String(exp);
}

export function ExperienceTool() {
  const [experiences, setExperiences] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError("");
    setResults([]);
    startTransition(async () => {
      const context = `[CARGO-ALVO: ${targetRole}]\n[EXPERIÊNCIAS ATUAIS DO USUÁRIO:\n${experiences}\n]\n\nReescreva cada experiência usando o formato: "Verbo de ação + Métrica quantificável + Contexto". Mostre progressão clara.`;
      const res = await generatePremiumContent(context, "rewrite");
      if (res.success && res.data && res.data.experienceRewrites.length > 0) {
        setResults(res.data.experienceRewrites.map(normalizeExp));
      } else {
        setError(res.error ?? "Erro ao reescrever experiências");
      }
    });
  };

  const canSubmit = experiences.trim().length > 10 && targetRole.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
        <div>
          <label htmlFor="exp-role" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Cargo-alvo *
          </label>
          <input
            id="exp-role"
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Ex: Front-end Developer"
            className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>

        <div>
          <label htmlFor="exp-current" className="mb-1.5 block text-xs font-medium text-zinc-400">
            Suas experiências atuais (como estão hoje) *
          </label>
          <textarea
            id="exp-current"
            value={experiences}
            onChange={(e) => setExperiences(e.target.value)}
            rows={6}
            placeholder={"Cole suas experiências como estão no LinkedIn/currículo:\n\nEx:\n- Desenvolvedor Front-end na Empresa X (2022-atual)\n  Responsável pelo desenvolvimento de interfaces\n  Trabalhei com React e TypeScript\n\n- Estagiário na Empresa Y (2021-2022)\n  Auxiliei no desenvolvimento de features"}
            className="w-full resize-none rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
          />
          <p className="mt-1 text-[10px] text-zinc-600">
            A IA vai reescrever com verbos de ação + métricas + contexto
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isPending || !canSubmit}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Reescrevendo...
            </span>
          ) : (
            "💼 Reescrever Experiências"
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-400">{error}</div>
      )}

      {results.length > 0 && (
        <div className="animate-fade-in-up rounded-2xl border border-violet-500/20 bg-zinc-900/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Experiências Otimizadas</h3>
            <button
              onClick={() => navigator.clipboard.writeText(results.join("\n\n"))}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Copiar todas
            </button>
          </div>
          <div className="space-y-3">
            {results.map((exp, i) => (
              <div key={i} className="group rounded-xl bg-zinc-800/50 p-4">
                <p className="text-sm leading-relaxed text-zinc-300">{exp}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(exp)}
                  className="mt-2 text-[10px] text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Copiar
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Formato: Verbo de ação + Métrica + Contexto — otimizado para ATS e Find Similar
          </p>
        </div>
      )}
    </div>
  );
}
