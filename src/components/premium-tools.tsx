"use client";

import { useState, useTransition } from "react";
import { generatePremiumContent } from "@/actions/premium";
import type { PremiumContent, PostIdea, AdvancedTip } from "@/types";

interface PremiumToolsProps {
  userName: string | null;
}

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

type Tab = "rewrite" | "about" | "beginner" | "calendar" | "tips";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PremiumTools(_props: PremiumToolsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("rewrite");
  const [content, setContent] = useState<PremiumContent | null>(null);
  const [isPending, startTransition] = useTransition();
  const [context, setContext] = useState("");
  const [error, setError] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceTime, setExperienceTime] = useState("");
  const [impact, setImpact] = useState("");

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "rewrite", label: "Perfil Otimizado", icon: "🚀" },
    { key: "about", label: "Reescrita IA", icon: "✍️" },
    { key: "beginner", label: "Guia Iniciante", icon: "🌱" },
    { key: "calendar", label: "Calendário Editorial", icon: "📅" },
    { key: "tips", label: "Dicas Avançadas", icon: "🎯" },
  ];

  const handleGenerate = () => {
    setError("");
    setContent(null);
    startTransition(async () => {
      const fullContext = (activeTab === "rewrite" || activeTab === "about")
        ? `${context}\n\n[CARGO-ALVO: ${targetRole}]\n[TEMPO DE EXPERIÊNCIA: ${experienceTime}]\n[COMPETÊNCIAS: ${skills}]\n[RESULTADOS/IMPACTO: ${impact}]`
        : context;
      const result = await generatePremiumContent(fullContext, activeTab);
      if (result.success && result.data) {
        setContent(result.data);
      } else {
        setError(result.error ?? "Erro ao gerar conteúdo. Tente novamente.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Ferramentas Premium"
        className="flex gap-1 overflow-x-auto rounded-2xl bg-zinc-900/80 p-1.5 backdrop-blur-sm"
      >
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => { setActiveTab(key); setContent(null); }}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
              activeTab === key
                ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Context input */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-sm">
        {/* Campos de cargo e skills para rewrite/about */}
        {(activeTab === "rewrite" || activeTab === "about") && (
          <div className="mb-4 space-y-3 border-b border-white/5 pb-4">
            <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">Dados para cruzamento com o mercado</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="target-role" className="mb-1 block text-xs text-zinc-400">
                  Foco da vaga desejada *
                </label>
                <input
                  id="target-role"
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Ex: Front-end, Back-end, DevOps..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>
              <div>
                <label htmlFor="experience-time" className="mb-1 block text-xs text-zinc-400">
                  Tempo de experiência *
                </label>
                <input
                  id="experience-time"
                  type="text"
                  value={experienceTime}
                  onChange={(e) => setExperienceTime(e.target.value)}
                  placeholder="Ex: 5 anos, 2 anos, recém-formado..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                />
              </div>
            </div>
            <div>
              <label htmlFor="user-skills" className="mb-1 block text-xs text-zinc-400">
                Suas competências técnicas *
              </label>
              <textarea
                id="user-skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                rows={3}
                placeholder={"Ex:\nReact, Next.js, TypeScript, React Native\nCI/CD, Docker, AWS, Vercel\nTailwindCSS, Design Systems, WCAG"}
                className="w-full resize-none rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
            <div>
              <label htmlFor="impact" className="mb-1 block text-xs text-zinc-400">
                Projetos relevantes, resultados e impactos gerados
              </label>
              <textarea
                id="impact"
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                rows={4}
                placeholder={"Conte sobre seus projetos e resultados. Ex:\n- Construí plataforma SaaS para setor de energia solar com +10K usuários\n- Reduzi tempo de deploy de 4h para 12min com CI/CD\n- Liderei time de 8 devs na migração para microsserviços\n- Aumentei conversão em 40% otimizando Core Web Vitals"}
                className="w-full resize-none rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              />
              <p className="mt-1 text-[10px] text-zinc-600">Quanto mais detalhes sobre seus projetos e resultados, mais personalizado será o Sobre gerado</p>
            </div>
          </div>
        )}

        <label
          htmlFor="context-input"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          {activeTab === "rewrite" && "Cole seu perfil atual, URL do LinkedIn ou texto do currículo:"}
          {activeTab === "about" && "Cole seu texto do 'Sobre', URL do LinkedIn ou descreva sua área:"}
          {activeTab === "beginner" && "Descreva sua área de atuação, cargo desejado e principais habilidades:"}
          {activeTab === "calendar" && "Descreva seu nicho, público-alvo e temas de interesse:"}
          {activeTab === "tips" && "Cole a URL do seu perfil ou descreva seu posicionamento atual:"}
        </label>
        <textarea
          id="context-input"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={4}
          placeholder={
            activeTab === "rewrite"
              ? "Cole aqui seu headline + sobre + experiências OU a URL do LinkedIn (ex: https://linkedin.com/in/seu-perfil)"
              : activeTab === "about"
                ? "Cole seu texto do Sobre atual OU a URL do LinkedIn (ex: https://linkedin.com/in/seu-perfil)"
                : activeTab === "beginner"
                  ? "Ex: Sou recém-formado em Ciência da Computação, quero atuar como dev front-end, sei React, TypeScript e CSS..."
                  : activeTab === "calendar"
                    ? "Ex: Atuo com marketing digital para startups B2B SaaS..."
                    : "Ex: https://linkedin.com/in/meu-perfil ou descreva seu posicionamento..."
          }
          className="w-full resize-none rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
        />
        <button
          onClick={handleGenerate}
          disabled={isPending || !context.trim() || ((activeTab === "rewrite" || activeTab === "about") && (!targetRole.trim() || !skills.trim() || !experienceTime.trim()))}
          aria-busy={isPending}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 disabled:opacity-50 disabled:shadow-none"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Gerando com IA...
            </span>
          ) : (
            <>
              {activeTab === "rewrite" && "✨ Gerar Perfil Otimizado"}
              {activeTab === "about" && "✨ Gerar Reescrita"}
              {activeTab === "beginner" && "✨ Gerar Guia Completo"}
              {activeTab === "calendar" && "✨ Gerar Calendário"}
              {activeTab === "tips" && "✨ Gerar Dicas Avançadas"}
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-xl bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Results */}
      {content && (
        <div className="space-y-6 animate-fade-in-up">
          {activeTab === "rewrite" && <RewriteResult content={content} />}
          {activeTab === "about" && <AboutResult content={content} />}
          {activeTab === "beginner" && <BeginnerResult content={content} />}
          {activeTab === "calendar" && <CalendarResult ideas={content.editorialCalendar} />}
          {activeTab === "tips" && <TipsResult tips={content.advancedTips} />}
        </div>
      )}
    </div>
  );
}

function RewriteResult({ content }: { content: PremiumContent }) {
  const copySection = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="space-y-4">
      {/* Headline */}
      {content.optimizedHeadline && (
        <div className="rounded-2xl border border-emerald-500/20 bg-zinc-900/80 p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">🎯</span>
              <h3 className="font-semibold text-white">Headline Otimizado</h3>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
              Peso: 35% no algoritmo
            </span>
          </div>
          <div className="rounded-xl bg-zinc-800/50 p-4">
            <p className="text-sm font-medium leading-relaxed text-white">
              {content.optimizedHeadline}
            </p>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            → Keywords nas primeiras palavras • Otimizado para buscas booleanas
          </p>
          <button
            onClick={() => copySection(content.optimizedHeadline ?? "")}
            className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copiar headline
          </button>
        </div>
      )}

      {/* About */}
      {content.aboutRewrite && (
        <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900/80 p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">✍️</span>
              <h3 className="font-semibold text-white">Seção Sobre Otimizada</h3>
            </div>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-medium text-cyan-400">
              Peso: 25% no algoritmo
            </span>
          </div>
          <div className="rounded-xl bg-zinc-800/50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {content.aboutRewrite}
            </p>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            → Hook nas 2 primeiras linhas • Keywords naturais • CTA no final
          </p>
          <button
            onClick={() => copySection(content.aboutRewrite)}
            className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copiar texto
          </button>
        </div>
      )}

      {/* Experiences */}
      {content.experienceRewrites.length > 0 && (
        <div className="rounded-2xl border border-violet-500/20 bg-zinc-900/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">💼</span>
              <h3 className="font-semibold text-white">Experiências Otimizadas</h3>
            </div>
            <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-medium text-violet-400">
              Peso: 40% no algoritmo
            </span>
          </div>
          <div className="space-y-3">
            {content.experienceRewrites.map((exp, i) => (
              <div key={i} className="group rounded-xl bg-zinc-800/50 p-4">
                <p className="text-sm leading-relaxed text-zinc-300">{normalizeExp(exp)}</p>
                <button
                  onClick={() => copySection(exp)}
                  className="mt-2 flex items-center gap-1 text-[10px] text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            → Verbo de ação + Métrica + Contexto • Otimizado para Find Similar
          </p>
        </div>
      )}
    </div>
  );
}

function AboutResult({ content }: { content: PremiumContent }) {
  return (
    <div className="space-y-4">
      {/* About rewrite */}
      <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900/80 p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">✍️</span>
          <h3 className="font-semibold text-white">Novo Texto do Sobre</h3>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
          {content.aboutRewrite}
        </p>
        <button
          onClick={() => navigator.clipboard.writeText(content.aboutRewrite)}
          className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copiar texto
        </button>
      </div>

      {/* Experience rewrites */}
      {content.experienceRewrites.length > 0 && (
        <div className="rounded-2xl border border-violet-500/20 bg-zinc-900/80 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">💼</span>
            <h3 className="font-semibold text-white">Experiências Reescritas</h3>
          </div>
          <div className="space-y-3">
            {content.experienceRewrites.map((exp, i) => (
              <div key={i} className="rounded-xl bg-zinc-800/50 p-4">
                <p className="text-sm leading-relaxed text-zinc-300">{normalizeExp(exp)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BeginnerResult({ content }: { content: PremiumContent }) {
  const copyAll = () => {
    const full = [
      content.optimizedHeadline ? `HEADLINE:\n${content.optimizedHeadline}` : "",
      content.aboutRewrite ? `\nSOBRE:\n${content.aboutRewrite}` : "",
      content.experienceRewrites.length > 0
        ? `\nEXPERIÊNCIAS:\n${content.experienceRewrites.join("\n\n")}`
        : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(full);
  };

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className="rounded-2xl border border-amber-500/20 bg-zinc-900/80 p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🌱</span>
          <h3 className="font-semibold text-white">Seu Perfil do Zero — Passo a Passo</h3>
        </div>
        <p className="text-sm text-zinc-400">
          Montamos seu perfil completo seguindo as regras do algoritmo do LinkedIn Recruiter.
          Copie cada seção e cole diretamente no seu perfil.
        </p>
      </div>

      {/* Step 1: Headline */}
      {content.optimizedHeadline && (
        <div className="rounded-2xl border border-emerald-500/20 bg-zinc-900/80 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">1</span>
            <h3 className="font-semibold text-white">Headline (Título)</h3>
          </div>
          <p className="mb-2 text-xs text-zinc-500">
            Cole no campo "Título" do LinkedIn. Coloque suas skills principais nas primeiras palavras.
          </p>
          <div className="rounded-xl bg-zinc-800/50 p-4">
            <p className="text-sm font-medium text-white">{content.optimizedHeadline}</p>
          </div>
        </div>
      )}

      {/* Step 2: About */}
      {content.aboutRewrite && (
        <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900/80 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">2</span>
            <h3 className="font-semibold text-white">Seção Sobre</h3>
          </div>
          <p className="mb-2 text-xs text-zinc-500">
            Cole no campo "Sobre" do LinkedIn. As 2 primeiras linhas são críticas (o LinkedIn corta ali).
          </p>
          <div className="rounded-xl bg-zinc-800/50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{content.aboutRewrite}</p>
          </div>
        </div>
      )}

      {/* Step 3: Experiences */}
      {content.experienceRewrites.length > 0 && (
        <div className="rounded-2xl border border-violet-500/20 bg-zinc-900/80 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-400">3</span>
            <h3 className="font-semibold text-white">Experiências</h3>
          </div>
          <p className="mb-3 text-xs text-zinc-500">
            Adicione cada experiência na seção "Experiência" do LinkedIn. Use o formato: Verbo + Métrica + Contexto.
          </p>
          <div className="space-y-3">
            {content.experienceRewrites.map((exp, i) => (
              <div key={i} className="rounded-xl bg-zinc-800/50 p-4">
                <p className="text-sm leading-relaxed text-zinc-300">{normalizeExp(exp)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Checklist */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-zinc-300">4</span>
          <h3 className="font-semibold text-white">Checklist Final</h3>
        </div>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex items-start gap-2"><span className="text-cyan-400">□</span> Adicione foto profissional (fundo neutro, rosto 60% do frame)</li>
          <li className="flex items-start gap-2"><span className="text-cyan-400">□</span> Ative "Open to Work" (modo oculto para recrutadores)</li>
          <li className="flex items-start gap-2"><span className="text-cyan-400">□</span> Adicione 5+ competências técnicas na seção Skills</li>
          <li className="flex items-start gap-2"><span className="text-cyan-400">□</span> Siga 10+ empresas do seu setor-alvo</li>
          <li className="flex items-start gap-2"><span className="text-cyan-400">□</span> Conecte-se com 50+ profissionais da sua área</li>
          <li className="flex items-start gap-2"><span className="text-cyan-400">□</span> Atualize localização e marque disponibilidade para relocação</li>
          <li className="flex items-start gap-2"><span className="text-cyan-400">□</span> Publique 1 post por semana para ativar "Active Talent"</li>
        </ul>
      </div>

      {/* Copy all */}
      <div className="flex justify-center">
        <button
          onClick={copyAll}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-500/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copiar Perfil Completo
        </button>
      </div>
    </div>
  );
}

function CalendarResult({ ideas }: { ideas: PostIdea[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">📅</span>
        <h3 className="font-semibold text-white">Seu Calendário Editorial</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {ideas.map((idea, i) => (
          <div
            key={i}
            className="group rounded-xl border border-white/5 bg-zinc-800/50 p-4 transition-all hover:border-cyan-500/20"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-400">
                {idea.day}
              </span>
            </div>
            <h4 className="text-sm font-medium text-white">{idea.topic}</h4>
            <p className="mt-1 text-xs text-zinc-400">{idea.hook}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {idea.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TipsResult({ tips }: { tips: AdvancedTip[] }) {
  const categoryIcons: Record<string, string> = {
    photo: "📸",
    tone: "🎯",
    hashtags: "#️⃣",
    engagement: "📈",
  };

  const categoryColors: Record<string, string> = {
    photo: "from-pink-500/20 to-rose-500/20 text-pink-300",
    tone: "from-amber-500/20 to-orange-500/20 text-amber-300",
    hashtags: "from-violet-500/20 to-purple-500/20 text-violet-300",
    engagement: "from-emerald-500/20 to-cyan-500/20 text-emerald-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">🎯</span>
        <h3 className="font-semibold text-white">Dicas Avançadas</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tips.map((tip, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 bg-zinc-800/50 p-5 transition-all hover:border-white/10"
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`rounded-lg bg-gradient-to-r px-2.5 py-1 text-xs font-medium ${categoryColors[tip.category] ?? "from-zinc-500/20 to-zinc-500/20 text-zinc-300"}`}
              >
                {categoryIcons[tip.category] ?? "💡"} {tip.category}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white">{tip.title}</h4>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              {tip.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
