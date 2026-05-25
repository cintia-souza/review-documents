"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { PremiumContent } from "@/types";

interface PremiumResponse {
  success: boolean;
  data?: PremiumContent;
  error?: string;
}

const inputSchema = z.object({
  context: z.string().min(10, "Contexto muito curto").max(5000, "Contexto muito longo"),
  tab: z.enum(["rewrite", "about", "beginner", "calendar", "tips"]),
});

const PROMPTS = {
  rewrite: `Você é um especialista em LinkedIn Recruiter, Skill Graph Modeling, Metodologia CHA e NER/TF-IDF.
Com base no perfil/currículo fornecido, REESCREVA o perfil completo otimizado para o algoritmo do LinkedIn Recruiter.

REGRAS DE REESCRITA DO HEADLINE:
1. O CARGO deve ser EXATAMENTE o cargo-alvo informado pelo usuário. NÃO mude.
2. NÃO repita skills do mesmo ecossistema. React/Next.js/TypeScript = MESMA stack. Agrupe como "React/Next.js" (1 slot só).
3. PRIORIZE skills COMPLEMENTARES que diferenciam: CI/CD, Testes, Cloud, Design Systems, Performance, Acessibilidade.
4. NUNCA inclua skills fora do foco. Se foco é Front-end, NÃO coloque Node.js, Python, Back-end.
5. Use 3-5 keywords: 1 stack principal agrupada + 2-3 complementares do cruzamento mercado x usuário.
6. Formato: "Cargo-alvo | Stack/Framework | Complementar1 | Complementar2 | Complementar3"

REGRAS DO SOBRE:
O Sobre deve ser ÚNICO e PERSONALIZADO para cada usuário. NÃO siga um template fixo.

ESTRUTURA FLEXÍVEL (adapte ao perfil do usuário):
- PRIMEIRA LINHA: Frase de impacto curta que resume a essência profissional. Pode incluir hashtags relevantes do cargo.
- PARÁGRAFO DE CONTEXTO: Quem é + especialidade + tempo + setores onde atuou + tipo de resultado que entrega. Deve soar natural, como se a pessoa estivesse se apresentando.
- LISTA DE COMPETÊNCIAS: Organize as skills do usuário de forma limpa e escaneável. Agrupe por categoria quando fizer sentido (ex: frameworks, infra, metodologias).

DIRETRIZES:
- Tom profissional mas acessível (não robótico)
- Use os DADOS REAIS do usuário (experiência, setores, resultados informados)
- NÃO invente métricas ou resultados que o usuário não informou
- NÃO use emojis excessivos (máximo 0-2)
- NÃO copie templates genéricos — cada Sobre deve refletir a história ÚNICA do profissional
- A lista de skills deve usar as competências REAIS informadas pelo usuário

REGRAS DAS EXPERIÊNCIAS:
Use formato "Verbo de ação + Métrica quantificável + Contexto". Mostre progressão clara.

Gere JSON com:
- optimizedHeadline: string com o headline otimizado seguindo as regras acima
- aboutRewrite: texto do Sobre otimizado (máx 300 palavras)
- experienceRewrites: array com 3-4 descrições de experiência reescritas
- editorialCalendar: array vazio
- advancedTips: array vazio
Responda APENAS com JSON válido.`,

  about: `Você é um especialista em branding pessoal no LinkedIn.
Com base no contexto fornecido, gere:
- aboutRewrite: um texto de "Sobre" profissional, impactante, com hook nas primeiras linhas (máx 300 palavras)
- experienceRewrites: array com 2-3 descrições de experiência reescritas com métricas e verbos de ação
- editorialCalendar: array vazio
- advancedTips: array vazio
Responda APENAS com JSON válido.`,

  calendar: `Você é um estrategista de conteúdo para LinkedIn.
Com base no nicho e público-alvo fornecido, gere:
- aboutRewrite: string vazia
- experienceRewrites: array vazio
- editorialCalendar: array com 8 objetos { day (ex: "Seg - Semana 1"), topic (tema do post), hook (primeira frase chamativa), hashtags (array de 3-4 hashtags sem #) }
- advancedTips: array vazio
Responda APENAS com JSON válido.`,

  beginner: `Você é um mentor de carreira especialista em LinkedIn para INICIANTES que estão montando o perfil do zero.
Com base na área de atuação, cargo desejado e habilidades fornecidas, CRIE um perfil completo otimizado para o algoritmo do LinkedIn Recruiter.

REGRAS:
1. HEADLINE: Formato "Cargo Desejado | Skill1 | Skill2 | Skill3". Direto, sem frases motivacionais.
2. SOBRE: Mesmo sem experiência formal, destaque projetos pessoais, formação, certificações e objetivos. Hook nas 2 primeiras linhas. CTA no final.
3. EXPERIÊNCIAS: Se não tem experiência formal, use projetos pessoais, freelances, contribuições open source ou estágios. Formato "Verbo + Resultado + Contexto".

Gere JSON com:
- optimizedHeadline: headline pronto para usar
- aboutRewrite: texto do Sobre completo (máx 250 palavras)
- experienceRewrites: array com 2-3 descrições de experiência/projetos
- editorialCalendar: array vazio
- advancedTips: array vazio
Responda APENAS com JSON válido.`,

  tips: `Você é um consultor de presença digital no LinkedIn.
Com base no perfil/posicionamento fornecido, gere:
- aboutRewrite: string vazia
- experienceRewrites: array vazio
- editorialCalendar: array vazio
- advancedTips: array com 6 objetos { category ("photo" | "tone" | "hashtags" | "engagement"), title (título curto), description (dica detalhada em 2-3 frases) }
Responda APENAS com JSON válido.`,
};

export async function generatePremiumContent(
  context: string,
  tab: "rewrite" | "about" | "beginner" | "calendar" | "tips"
): Promise<PremiumResponse> {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Faça login para continuar" };
    }

    // 2. Plan check — only Premium users
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (user?.plan !== "PREMIUM") {
      return { success: false, error: "Recurso exclusivo para assinantes Premium" };
    }

    // 3. Input validation
    const parsed = inputSchema.safeParse({ context, tab });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // 4. Call AI
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { success: false, error: "Serviço de IA indisponível. Configure a GEMINI_API_KEY." };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${PROMPTS[tab]}\n\nContexto do usuário:\n${parsed.data.context}` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: "Limite de requisições atingido. Aguarde 1 minuto e tente novamente." };
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      candidates: { content: { parts: { text: string }[] } }[];
    };

    const raw = data.candidates[0].content.parts[0].text;
    const result = JSON.parse(raw) as PremiumContent;

    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}

function simulatedContent(tab: "rewrite" | "about" | "beginner" | "calendar" | "tips"): PremiumContent {
  if (tab === "rewrite") {
    return {
      optimizedHeadline: "Desenvolvedora Front-end | React/Next.js | CI/CD | Design Systems | AWS",
      aboutRewrite:
        "🚀 +20 projetos entregues impactando 500K+ usuários em 5 anos de desenvolvimento.\n\nConecto tecnologia com estratégia de negócio para criar produtos digitais que geram resultado mensurável. Especialista em React/Next.js com foco em performance e experiência do usuário.\n\n📊 Resultados que entrego:\n• Redução de 70% no tempo de deploy via CI/CD\n• Aumento de 40% em conversão com otimização de Core Web Vitals\n• NPS +18 pontos após reestruturação de produto\n\n💡 Stack: React, Next.js, TypeScript, Node.js, PostgreSQL, AWS\n\n📩 Aberta a novas oportunidades. Vamos conversar?",
      experienceRewrites: [
        "Liderei squad de 8 devs na migração de monolito para microsserviços, reduzindo tempo de deploy de 4h para 12min e elevando uptime para 99.9% — impactando 200K usuários ativos.",
        "Arquitetei e implementei pipeline de CI/CD com GitHub Actions que reduziu bugs em produção em 73% e acelerou ciclo de entregas em 2x, resultando em NPS +18 pontos.",
        "Otimizei Core Web Vitals (LCP, FID, CLS) de 3 produtos SaaS, gerando aumento de 40% na taxa de conversão e redução de 25% no bounce rate.",
      ],
      editorialCalendar: [],
      advancedTips: [],
    };
  }

  if (tab === "beginner") {
    return {
      optimizedHeadline: "Desenvolvedor Front-end Jr | React | TypeScript | CSS | Buscando primeira oportunidade",
      aboutRewrite:
        "🚀 Desenvolvedor Front-end em início de carreira com projetos práticos em React e TypeScript.\n\nRecém-formado em Ciência da Computação, dediquei os últimos 12 meses a construir projetos reais que resolvem problemas reais. Meu foco é criar interfaces acessíveis, performantes e com ótima experiência do usuário.\n\n🛠️ Stack: React, Next.js, TypeScript, Tailwind CSS, Git\n\n🌟 O que me diferencia:\n• 3 projetos full-stack publicados no GitHub\n• Contribuições em 2 projetos open source\n• Certificação Meta Front-End Developer\n\n📩 Aberto a oportunidades. Vamos conversar?",
      experienceRewrites: [
        "Desenvolvi aplicação SaaS de análise de perfis com Next.js 16, TypeScript e Tailwind CSS, implementando autenticação JWT, integração com API de IA e deploy na Vercel — projeto pessoal com 500+ visitas.",
        "Contribuí com 12 pull requests aceitos em projeto open source React (2K+ stars), corrigindo bugs de acessibilidade e otimizando performance de renderização em 30%.",
        "Criei portfólio responsivo com score 98/100 no Lighthouse, utilizando Next.js, animações CSS e SEO otimizado — resultando em 3 convites para entrevistas.",
      ],
      editorialCalendar: [],
      advancedTips: [],
    };
  }

  if (tab === "about") {
    return {
      aboutRewrite:
        "🚀 Transformo ideias em produtos digitais que geram impacto.\n\nCom mais de 5 anos liderando equipes de desenvolvimento, já entreguei +20 projetos que impactaram mais de 500 mil usuários. Minha especialidade é conectar tecnologia com estratégia de negócio.\n\n💡 O que me diferencia:\n• Visão end-to-end: do discovery ao deploy\n• Foco em métricas que importam (retenção, conversão, NPS)\n• Comunicação clara entre times técnicos e stakeholders\n\n📩 Vamos conversar? Me envie uma mensagem.",
      experienceRewrites: [
        "Liderei squad de 8 pessoas na migração de monolito para microsserviços, reduzindo tempo de deploy de 4h para 12min e aumentando uptime para 99.9%.",
        "Implementei pipeline de CI/CD que reduziu bugs em produção em 73% e acelerou entregas em 2x, impactando diretamente a satisfação do cliente (NPS +18 pontos).",
      ],
      editorialCalendar: [],
      advancedTips: [],
    };
  }

  if (tab === "calendar") {
    return {
      aboutRewrite: "",
      experienceRewrites: [],
      editorialCalendar: [
        { day: "Seg - Semana 1", topic: "Bastidores do trabalho", hook: "Ninguém te conta isso sobre liderar um time de tech...", hashtags: ["liderança", "tech", "carreira"] },
        { day: "Qua - Semana 1", topic: "Dica técnica rápida", hook: "3 comandos que salvam 2h do meu dia como dev:", hashtags: ["programação", "produtividade", "dicas"] },
        { day: "Sex - Semana 1", topic: "Reflexão de carreira", hook: "O maior erro que cometi na minha carreira (e o que aprendi):", hashtags: ["carreira", "aprendizado", "crescimento"] },
        { day: "Seg - Semana 2", topic: "Case de sucesso", hook: "Como reduzimos o tempo de deploy de 4h para 12 minutos:", hashtags: ["devops", "resultados", "engenharia"] },
        { day: "Qua - Semana 2", topic: "Opinião polêmica", hook: "Unpopular opinion: código limpo nem sempre é a prioridade.", hashtags: ["desenvolvimento", "opinião", "debate"] },
        { day: "Sex - Semana 2", topic: "Recomendação", hook: "5 ferramentas que uso todo dia e que mudaram minha produtividade:", hashtags: ["ferramentas", "produtividade", "tech"] },
        { day: "Seg - Semana 3", topic: "Storytelling pessoal", hook: "Há 3 anos eu quase desisti da área de tecnologia. Eis o que mudou:", hashtags: ["motivação", "história", "resiliência"] },
        { day: "Qua - Semana 3", topic: "Tutorial/How-to", hook: "Passo a passo: como estruturei meu portfólio que me rendeu 3 propostas:", hashtags: ["portfólio", "carreira", "tutorial"] },
      ],
      advancedTips: [],
    };
  }

  return {
    aboutRewrite: "",
    experienceRewrites: [],
    editorialCalendar: [],
    advancedTips: [
      { category: "photo", title: "Fundo neutro e iluminação natural", description: "Fotos com fundo limpo e luz natural geram 14x mais visualizações. Evite selfies e fotos cortadas de grupo. Invista em um retrato profissional com sorriso leve." },
      { category: "photo", title: "Enquadramento correto", description: "O rosto deve ocupar 60% do frame. Olhe diretamente para a câmera. Perfis com fotos profissionais recebem 21x mais visualizações." },
      { category: "tone", title: "Primeira pessoa, tom conversacional", description: "Escreva como se estivesse conversando com um colega. Evite jargões corporativos vazios como 'sinergia' e 'proatividade'. Seja específico e autêntico." },
      { category: "tone", title: "Hook nas primeiras 2 linhas", description: "O LinkedIn mostra apenas 2 linhas antes do 'ver mais'. Use números, perguntas ou afirmações ousadas para gerar clique." },
      { category: "hashtags", title: "Mix de volume", description: "Use 3-5 hashtags: 1 grande (+1M seguidores), 2 médias (10K-500K) e 1-2 de nicho (<10K). Isso maximiza alcance sem competir com posts virais." },
      { category: "engagement", title: "Responda nos primeiros 60 min", description: "O algoritmo prioriza posts com engajamento rápido. Responda todos os comentários na primeira hora. Faça perguntas no final do post para estimular respostas." },
    ],
  };
}
