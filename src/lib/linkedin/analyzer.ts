/**
 * Analyzer de competências front-end.
 * Recebe descrições de vagas e extrai ranking de skills.
 */

export interface SkillRanking {
  skill: string;
  count: number;
  percentage: number;
}

const FRONTEND_SKILLS = [
  // Linguagens core
  "javascript", "typescript", "html", "css",
  // Frameworks & Libs
  "react", "angular", "vue", "next.js", "nuxt", "svelte", "gatsby", "remix", "astro",
  // State Management
  "redux", "zustand", "mobx", "recoil", "context api", "ngrx", "pinia", "vuex",
  // Estilização
  "sass", "less", "tailwind", "styled-components", "css modules", "bootstrap", "material ui", "chakra ui", "ant design", "radix",
  // Build & Tooling
  "webpack", "vite", "babel", "eslint", "prettier", "turbopack", "esbuild", "rollup", "storybook",
  // Testes
  "jest", "testing library", "cypress", "playwright", "vitest", "enzyme",
  // Performance & SEO
  "seo", "core web vitals", "lighthouse", "lazy loading", "ssr", "ssg", "pwa",
  // APIs & Comunicação
  "api rest", "restful", "graphql", "axios", "fetch", "websocket", "react query", "swr", "tanstack",
  // Versionamento & CI
  "git", "github", "gitlab", "ci/cd", "github actions", "vercel", "netlify",
  // Design & UX
  "figma", "design system", "acessibilidade", "accessibility", "wcag", "responsive", "mobile first", "ui/ux",
  // Conceitos
  "clean code", "solid", "design patterns", "tdd", "agile", "scrum",
  // Extras
  "node.js", "docker", "english", "inglês",
];

export function analyzeSkills(descriptions: string[]): SkillRanking[] {
  const skillCount = new Map<string, number>();
  const total = descriptions.length;

  for (const desc of descriptions) {
    const text = desc.toLowerCase();
    const foundInJob = new Set<string>();

    for (const skill of FRONTEND_SKILLS) {
      if (foundInJob.has(skill)) continue;
      const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, "i");
      if (regex.test(text)) {
        foundInJob.add(skill);
        skillCount.set(skill, (skillCount.get(skill) || 0) + 1);
      }
    }
  }

  return Array.from(skillCount.entries())
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
