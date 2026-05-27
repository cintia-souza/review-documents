"use client";

import { useState, useTransition } from "react";
import { generatePremiumContent } from "@/actions/premium";
import type { PremiumContent } from "@/types";

interface MarketSkill {
  skill: string;
  percentage: number;
  userHas: boolean;
}

export function HeadlineTool() {
  const [targetRole, setTargetRole] = useState("");
  const [seniority, setSeniority] = useState("pleno");
  const [skills, setSkills] = useState("");
  const [headline, setHeadline] = useState("");
  const [marketSkills, setMarketSkills] = useState<MarketSkill[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    setError("");
    setHeadline("");
    setMarketSkills([]);
    startTransition(async () => {
      const context = `[CARGO-ALVO: ${targetRole}]
[SENIORIDADE: ${seniority}]
[COMPETÊNCIAS DO USUÁRIO: ${skills}]

TAREFA DUPLA:
1. Liste as 15 competências técnicas mais pedidas nas vagas de "${targetRole}" nível "${seniority}" no mercado brasileiro. Para cada uma, estime a % de vagas que pedem (0-100).
2. Gere um headline otimizado seguindo as regras.

Responda com JSON:
{
  "optimizedHeadline": "headline aqui",
  "aboutRewrite": "",
  "experienceRewrites": [],
  "editorialCalendar": [],
  "advancedTips": [],
  "marketSkills": [{"skill": "nome", "percentage": 90}, ...]
}`;

      const res = await generatePremiumContent(context, "rewrite");
      if (res.success && res.data) {
        setHeadline(res.data.optimizedHeadline ?? "");

        // Parse market skills from response
        const data = res.data as PremiumContent & { marketSkills?: { skill: string; percentage: number }[] };
        if (data.marketSkills && Array.isArray(data.marketSkills)) {
          const userSkillsLower = skills.toLowerCase();
          const parsed: MarketSkill[] = data.marketSkills
            .filter((s) => s.skill && s.percentage)
            .map((s) => ({
              skill: s.skill,
              percentage: s.percentage,
              userHas: userSkillsLower.includes(s.skill.toLowerCase()),
            }))
            .sort((a, b) => b.percentage - a.percentage);
          setMarketSkills(parsed);
        }
      } else {
        setError(res.error ?? "Erro ao analisar mercado");
      }
    });
  };

  const canSubmit = targetRole.trim().length > 0 && skills.trim().length > 0;
  const matchCount = marketSkills.filter((s) => s.userHas).length;
  const totalSkills = marketSkills.length;

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
            placeholder={"Ex: React, Next.js, TypeScript, CI/CD, AWS, Design Systems, Docker, Jest..."}
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
            "🎯 Analisar Mercado + Gerar Headline"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-400">{error}</div>
      )}

      {/* Results */}
      {(headline || marketSkills.length > 0) && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Market Skills Ranking */}
          {marketSkills.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">
                    Competências mais pedidas — {targetRole} ({seniority})
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Baseado na análise de vagas reais do mercado
                  </p>
                </div>
                <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                  {matchCount}/{totalSkills} match
                </div>
              </div>

              <div className="space-y-2">
                {marketSkills.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {/* Match indicator */}
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      s.userHas
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-800 text-zinc-500"
                    }`}>
                      {s.userHas ? "✓" : "×"}
                    </div>

                    {/* Skill name */}
                    <span className={`w-32 shrink-0 text-xs font-medium ${
                      s.userHas ? "text-white" : "text-zinc-400"
                    }`}>
                      {s.skill}
                    </span>

                    {/* Progress bar */}
                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            s.userHas
                              ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                              : "bg-gradient-to-r from-zinc-600 to-zinc-500"
                          }`}
                          style={{ width: `${s.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Percentage */}
                    <span className="w-10 shrink-0 text-right text-xs text-zinc-500">
                      {s.percentage}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-4 border-t border-white/5 pt-3 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Você domina
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-zinc-600" /> GAP — considere aprender
                </span>
              </div>
            </div>
          )}

          {/* Headline Result */}
          {headline && (
            <div className="rounded-2xl border border-emerald-500/20 bg-zinc-900/80 p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-white">Headline Sugerido</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(headline)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  Copiar
                </button>
              </div>
              <p className="rounded-xl bg-zinc-800/50 p-4 text-sm font-medium text-white">
                {headline}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Baseado no cruzamento: competências do mercado × suas skills ({matchCount} matches)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
