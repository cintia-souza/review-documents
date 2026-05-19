"use client";

import { useState, useTransition } from "react";
import { generatePremiumContent } from "@/actions/premium";
import type { PremiumContent, PostIdea, AdvancedTip } from "@/types";

interface PremiumToolsProps {
  userName: string | null;
}

type Tab = "about" | "calendar" | "tips";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PremiumTools(_props: PremiumToolsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const [content, setContent] = useState<PremiumContent | null>(null);
  const [isPending, startTransition] = useTransition();
  const [context, setContext] = useState("");

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "about", label: "Reescrita IA", icon: "✍️" },
    { key: "calendar", label: "Calendário Editorial", icon: "📅" },
    { key: "tips", label: "Dicas Avançadas", icon: "🎯" },
  ];

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generatePremiumContent(context, activeTab);
      if (result.success && result.data) {
        setContent(result.data);
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
            onClick={() => setActiveTab(key)}
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
        <label
          htmlFor="context-input"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          {activeTab === "about" && "Cole seu texto atual do 'Sobre' ou descreva sua área de atuação:"}
          {activeTab === "calendar" && "Descreva seu nicho, público-alvo e temas de interesse:"}
          {activeTab === "tips" && "Cole a URL do seu perfil ou descreva seu posicionamento atual:"}
        </label>
        <textarea
          id="context-input"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={4}
          placeholder={
            activeTab === "about"
              ? "Ex: Sou desenvolvedor full-stack com 5 anos de experiência em React e Node.js..."
              : activeTab === "calendar"
                ? "Ex: Atuo com marketing digital para startups B2B SaaS..."
                : "Ex: https://linkedin.com/in/meu-perfil ou descreva seu posicionamento..."
          }
          className="w-full resize-none rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
        />
        <button
          onClick={handleGenerate}
          disabled={isPending || !context.trim()}
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
              {activeTab === "about" && "✨ Gerar Reescrita"}
              {activeTab === "calendar" && "✨ Gerar Calendário"}
              {activeTab === "tips" && "✨ Gerar Dicas Avançadas"}
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {content && (
        <div className="space-y-6 animate-fade-in-up">
          {activeTab === "about" && <AboutResult content={content} />}
          {activeTab === "calendar" && <CalendarResult ideas={content.editorialCalendar} />}
          {activeTab === "tips" && <TipsResult tips={content.advancedTips} />}
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
                <p className="text-sm leading-relaxed text-zinc-300">{exp}</p>
              </div>
            ))}
          </div>
        </div>
      )}
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
