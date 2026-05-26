/**
 * Integração do LinkedIn Scraper com o ProfileAI.
 * 
 * Busca competências mais pedidas nas vagas reais e cacheia no banco.
 * Usado pela IA para sugerir headlines e melhorias baseadas no mercado atual.
 */
import { prisma } from "@/lib/prisma";

export interface MarketSkill {
  skill: string;
  count: number;
  percentage: number;
}

export interface MarketAnalysis {
  id: string;
  searchTag: string;
  totalScraped: number;
  totalAnalyzed: number;
  skills: MarketSkill[];
  createdAt: Date;
}

// Busca a análise mais recente do cache (válida por 6h)
export async function getLatestMarketAnalysis(searchTag: string): Promise<MarketAnalysis | null> {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  const cached = await prisma.marketAnalysis.findFirst({
    where: {
      searchTag,
      createdAt: { gte: sixHoursAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!cached) return null;

  return {
    id: cached.id,
    searchTag: cached.searchTag,
    totalScraped: cached.totalScraped,
    totalAnalyzed: cached.totalAnalyzed,
    skills: cached.skills as unknown as MarketSkill[],
    createdAt: cached.createdAt,
  };
}

// Salva nova análise no cache
export async function saveMarketAnalysis(data: {
  searchTag: string;
  totalScraped: number;
  totalAnalyzed: number;
  skills: MarketSkill[];
}): Promise<MarketAnalysis> {
  const saved = await prisma.marketAnalysis.create({
    data: {
      searchTag: data.searchTag,
      totalScraped: data.totalScraped,
      totalAnalyzed: data.totalAnalyzed,
      skills: JSON.parse(JSON.stringify(data.skills)),
    },
  });

  return {
    id: saved.id,
    searchTag: saved.searchTag,
    totalScraped: saved.totalScraped,
    totalAnalyzed: saved.totalAnalyzed,
    skills: saved.skills as unknown as MarketSkill[],
    createdAt: saved.createdAt,
  };
}

// Formata skills do mercado para injetar no prompt da IA
export function formatMarketContext(analysis: MarketAnalysis): string {
  const top15 = analysis.skills.slice(0, 15);
  const skillList = top15
    .map((s) => `${s.skill} (${s.percentage}% das vagas)`)
    .join(", ");

  return `
DADOS REAIS DO MERCADO (${analysis.totalScraped} vagas de "${analysis.searchTag}" analisadas em ${analysis.createdAt.toLocaleDateString("pt-BR")}):
Competências mais pedidas: ${skillList}.
Use esses dados para priorizar sugestões de headline e skills que o mercado realmente demanda.`;
}
