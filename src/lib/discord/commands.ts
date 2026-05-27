/**
 * Handlers dos Slash Commands do bot Discord.
 * Cada comando consulta os dados salvos pelo scraper Lambda.
 */
import { prisma } from '@/lib/prisma';
import type { MarketSkill } from '@/lib/linkedin/market';

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

interface CommandResponse {
  content?: string;
  embeds?: DiscordEmbed[];
}

// ─── /vagas-frontend ──────────────────────────────────────────────────────────

export async function handleVagas(tag: string): Promise<CommandResponse> {
  // Busca vagas recentes do DynamoDB via Prisma (ou dados cacheados)
  const analysis = await getLatestAnalysis(tag);

  if (!analysis) {
    return { content: `⚠️ Nenhum dado disponível para \`${tag}\`. Aguarde a próxima execução do scraper.` };
  }

  const skills = analysis.skills as unknown as MarketSkill[];
  const top15 = skills.slice(0, 15);

  const table = top15
    .map((s, i) => {
      const bar = '█'.repeat(Math.round(s.percentage / 10)) + '░'.repeat(10 - Math.round(s.percentage / 10));
      return `\`${String(i + 1).padStart(2)}\` ${bar} **${s.skill}** — ${s.percentage}% (${s.count})`;
    })
    .join('\n');

  return {
    embeds: [{
      title: `🚀 Vagas — \`${tag}\``,
      description: `**${analysis.totalScraped} vagas** encontradas na última busca\n\n📊 **Top Skills pedidas:**\n${table}`,
      color: 0x0a66c2,
      fields: [
        { name: '🔍 Total buscado', value: String(analysis.totalScraped), inline: true },
        { name: '📄 Analisadas', value: String(analysis.totalAnalyzed), inline: true },
      ],
      footer: { text: `Última atualização: ${analysis.createdAt.toLocaleDateString('pt-BR')} ${analysis.createdAt.toLocaleTimeString('pt-BR')}` },
      timestamp: analysis.createdAt.toISOString(),
    }],
  };
}

// ─── /analise-frontend ────────────────────────────────────────────────────────

export async function handleAnalise(tag: string): Promise<CommandResponse> {
  const analysis = await getLatestAnalysis(tag);

  if (!analysis) {
    return { content: `⚠️ Nenhuma análise disponível para \`${tag}\`.` };
  }

  const skills = analysis.skills as unknown as MarketSkill[];

  // Separa por categorias simples
  const languages = ['javascript', 'typescript', 'html', 'css', 'python', 'java', 'sql', 'go', 'rust', 'php'];
  const frameworks = ['react', 'angular', 'vue', 'next.js', 'node.js', 'spring', 'django', 'express', 'nestjs'];

  const langSkills = skills.filter((s) => languages.includes(s.skill));
  const fwSkills = skills.filter((s) => frameworks.includes(s.skill));
  const otherSkills = skills.filter((s) => !languages.includes(s.skill) && !frameworks.includes(s.skill));

  const formatList = (items: MarketSkill[]) =>
    items.slice(0, 8).map((s) => `\`${s.percentage}%\` ${s.skill}`).join(' • ') || '_Nenhuma_';

  return {
    embeds: [{
      title: `📊 Análise de Mercado — \`${tag}\``,
      description: `Baseado em **${analysis.totalAnalyzed} descrições** de vagas analisadas.`,
      color: 0x8b5cf6,
      fields: [
        { name: '💻 Linguagens', value: formatList(langSkills), inline: false },
        { name: '⚙️ Frameworks', value: formatList(fwSkills), inline: false },
        { name: '🔧 Outros', value: formatList(otherSkills.slice(0, 8)), inline: false },
        { name: '📈 Total de skills', value: String(skills.length), inline: true },
        { name: '📄 Vagas analisadas', value: String(analysis.totalAnalyzed), inline: true },
      ],
      footer: { text: `${analysis.createdAt.toLocaleDateString('pt-BR')} ${analysis.createdAt.toLocaleTimeString('pt-BR')}` },
      timestamp: analysis.createdAt.toISOString(),
    }],
  };
}

// ─── /mapa [cargo] ────────────────────────────────────────────────────────────

export async function handleMapa(targetRole: string): Promise<CommandResponse> {
  // Busca análise mais próxima do cargo
  const analysis = await prisma.marketAnalysis.findFirst({
    where: { searchTag: { contains: targetRole.toLowerCase().split(' ')[0] } },
    orderBy: { createdAt: 'desc' },
  });

  if (!analysis) {
    return {
      content: `⚠️ Nenhum mapeamento disponível para \`${targetRole}\`.\n\nDica: O scraper roda a cada 12h com a tag configurada. Para buscar outro cargo, atualize o \`SEARCH_TAG\` e \`SEARCH_KEYWORDS\` no deploy.`,
    };
  }

  const skills = analysis.skills as unknown as MarketSkill[];
  const top20 = skills.slice(0, 20);

  const table = top20
    .map((s, i) => {
      const bar = '█'.repeat(Math.round(s.percentage / 10)) + '░'.repeat(10 - Math.round(s.percentage / 10));
      return `\`${String(i + 1).padStart(2)}\` ${bar} **${s.skill}** — ${s.percentage}%`;
    })
    .join('\n');

  return {
    embeds: [{
      title: `🗺️ Mapa de Mercado — \`${analysis.searchTag}\``,
      description: table,
      color: 0x8b5cf6,
      fields: [
        { name: '🔍 Vagas', value: String(analysis.totalScraped), inline: true },
        { name: '📄 Analisadas', value: String(analysis.totalAnalyzed), inline: true },
      ],
      footer: { text: `Atualizado: ${analysis.createdAt.toLocaleDateString('pt-BR')}` },
      timestamp: analysis.createdAt.toISOString(),
    }],
  };
}

// ─── UTILS ────────────────────────────────────────────────────────────────────

async function getLatestAnalysis(searchTag: string) {
  return prisma.marketAnalysis.findFirst({
    where: { searchTag },
    orderBy: { createdAt: 'desc' },
  });
}
