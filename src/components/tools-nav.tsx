"use client";

import { useState } from "react";
import { HeadlineTool } from "./tools/headline-tool";
import { AboutTool } from "./tools/about-tool";
import { ExperienceTool } from "./tools/experience-tool";

type ToolTab = "headline" | "about" | "experience";

export function ToolsNav() {
  const [activeTab, setActiveTab] = useState<ToolTab>("headline");

  const tabs: { key: ToolTab; label: string; icon: string; desc: string }[] = [
    { key: "headline", label: "Headline", icon: "🎯", desc: "Título otimizado para o algoritmo" },
    { key: "about", label: "Sobre", icon: "✍️", desc: "Seção About personalizada" },
    { key: "experience", label: "Experiências", icon: "💼", desc: "Reescrita com métricas" },
  ];

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <nav aria-label="Ferramentas de otimização" className="flex gap-1 rounded-2xl bg-zinc-900/80 p-1.5 backdrop-blur-sm">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            aria-selected={activeTab === key}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
              activeTab === key
                ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Description */}
      <p className="text-center text-sm text-zinc-500">
        {tabs.find((t) => t.key === activeTab)?.desc}
      </p>

      {/* Tool Content */}
      <div>
        {activeTab === "headline" && <HeadlineTool />}
        {activeTab === "about" && <AboutTool />}
        {activeTab === "experience" && <ExperienceTool />}
      </div>
    </div>
  );
}
