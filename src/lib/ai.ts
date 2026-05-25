import type { ProfileScores, ProfileFeedback } from "@/types";

interface AIAnalysisResponse {
  scores: ProfileScores;
  feedback: ProfileFeedback;
}

const PDF_PROMPT = `Você é um sistema especialista em Recrutamento & Seleção e PLN aplicado a currículos.

Analise usando 3 MODELOS: Skill Graph Modeling, Metodologia CHA e NER+TF-IDF.

SKILL GRAPH: Habilidades são teia de conexões. "Next.js" implica React, JS, TS, Front-end. Pontue por proximidade semântica. Identifique GAPS.
CHA: C=Formação/certificações. H=Verbos de ação+métricas. A=Tom da escrita/atitude.
NER+TF-IDF: Parsing em blocos semânticos claros? Densidade de termos técnicos equilibrada?

REGRA CRÍTICA PARA HEADLINE:
O headline/título deve conter 3-5 palavras-chave que são as MAIS FREQUENTES nas vagas reais do cargo-alvo.
NÃO use as skills que o candidato "acha" importantes — use as que o MERCADO exige.
Para descobrir: analise mentalmente o que 90% das vagas do cargo pedem em comum.
Ex: Se o foco é Front-end, vagas reais pedem React, TypeScript, CI/CD, Testes em 90% dos casos.
O headline deve refletir EXATAMENTE essas keywords de alta frequência no mercado.

PONTUAÇÃO: title(0-100,peso35%), summary(0-100,peso25%), experience(0-100,peso40%), overall=title*0.35+summary*0.25+experience*0.40

JSON: {"scores":{"title":N,"summary":N,"experience":N,"overall":N},"feedback":{"title":"[Skill Graph/NER] feedback sobre headline com base nas keywords mais frequentes do mercado","summary":"[CHA-Atitude] feedback","experience":"[TF-IDF/CHA-Habilidade] feedback","tips":["5 dicas com tags [Skill Graph],[CHA],[NER/ATS],[TF-IDF],[Parsing]"]}}

Responda APENAS JSON válido.`;

const LINKEDIN_PROMPT = `Você é um especialista no algoritmo do LinkedIn Recruiter.

Analise usando os 4 PILARES DO ALGORITMO:

PILAR 1 - Correspondência Semântica: Headline+Skills+Sobre varridos com buscas booleanas. Título tem MAIOR PESO.
PILAR 2 - Spotlights: Open to Work, Active Talent (30 dias), Engaged with Talent Brand (4x InMail).
PILAR 3 - Conexão/Localidade: Filtro de localização ELIMINATÓRIO. 1º e 2º grau ganham boost.
PILAR 4 - Find Similar: Padrão de carreira (progressão, tempo, faculdade, empresas) = DNA profissional.

REGRA CRÍTICA PARA HEADLINE:
O headline deve conter 3-5 palavras-chave baseadas nas COMPETÊNCIAS MAIS FREQUENTES nas vagas reais do cargo desejado.
NÃO recomende skills que o candidato "acha" importantes — recomende as que o MERCADO exige.
Método: Analise mentalmente o que 90% das vagas do cargo pedem em comum.
Ex: Se o foco é Front-end, vagas reais pedem React, TypeScript, CI/CD, Testes Unitários em 90% dos casos.
O headline DEVE refletir essas keywords de alta frequência, não termos genéricos ou poéticos.
Formato ideal: "Cargo | Skill1 | Skill2 | Skill3" (3-5 keywords do mercado)

PONTUAÇÃO: title(0-100,peso35%), summary(0-100,peso25%), experience(0-100,peso40%), overall=title*0.35+summary*0.25+experience*0.40

JSON: {"scores":{"title":N,"summary":N,"experience":N,"overall":N},"feedback":{"title":"[Pilar 1/4] feedback headline com sugestão de keywords baseadas na frequência real do mercado","summary":"[Pilar 1/2] feedback sobre","experience":"[Pilar 3/4] feedback experiências","tips":["5 dicas com tags [Pilar 1],[Pilar 2],[Pilar 3],[Pilar 4],[Headline],[Auditoria]"]}}

Responda APENAS JSON válido.`;

export async function analyzeWithAI(text: string): Promise<AIAnalysisResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return simulatedLinkedinAnalysis();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${LINKEDIN_PROMPT}\n\nPERFIL LINKEDIN:\n${text}` }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 429) return simulatedLinkedinAnalysis();
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = (await response.json()) as { candidates: { content: { parts: { text: string }[] } }[] };
  return JSON.parse(data.candidates[0].content.parts[0].text) as AIAnalysisResponse;
}

export async function analyzePDFWithAI(base64: string): Promise<AIAnalysisResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return simulatedPDFAnalysis();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: "application/pdf", data: base64 } },
            { text: `${PDF_PROMPT}\n\nAnalise o currículo neste PDF.` },
          ],
        }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 429) return simulatedPDFAnalysis();
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = (await response.json()) as { candidates: { content: { parts: { text: string }[] } }[] };
  return JSON.parse(data.candidates[0].content.parts[0].text) as AIAnalysisResponse;
}

function simulatedLinkedinAnalysis(): AIAnalysisResponse {
  return {
    scores: { title: 42, summary: 48, experience: 61, overall: 53 },
    feedback: {
      title: "[Pilar 1] Seu headline usa termos genéricos que não aparecem em buscas booleanas do Recruiter. Coloque suas 3 principais Hard Skills nas primeiras palavras do título (Ex: 'Desenvolvedora Front-end | React | Next.js | TypeScript').",
      summary: "[Pilar 2] Seu Sobre não tem hook nas primeiras 2 linhas (o LinkedIn corta ali no 'ver mais'). Comece com uma métrica de impacto. Ative 'Open to Work' e interaja semanalmente para aparecer no filtro Active Talent.",
      experience: "[Pilar 4] Suas experiências não mostram progressão clara — o algoritmo Find Similar prioriza jornadas legíveis. Use formato: 'Verbo + Métrica + Contexto' e garanta consistência de datas entre LinkedIn e currículo.",
      tips: [
        "[Pilar 2] Ative 'Open to Work' (modo oculto) — aumenta visibilidade em até 3x no filtro Spotlight",
        "[Pilar 1] Top 5 Hard Skills devem estar EXPLÍCITAS na seção Competências E no título",
        "[Pilar 4] Garanta progressão clara (Jr → Pleno → Sênior) — Find Similar prioriza padrões legíveis",
        "[Pilar 3] Atualize localização e marque disponibilidade para recolocação — filtro ELIMINATÓRIO",
        "[Pilar 2] Siga empresas-alvo e interaja com posts — Engaged with Talent Brand = 4x mais InMails",
      ],
    },
  };
}

function simulatedPDFAnalysis(): AIAnalysisResponse {
  return {
    scores: { title: 45, summary: 52, experience: 58, overall: 52 },
    feedback: {
      title: "[Skill Graph] O título/objetivo do currículo não cobre o ecossistema completo do cargo-alvo. Se busca vaga de Front-end, inclua explicitamente: React, TypeScript, Next.js. Skills diretas sempre vencem na triagem do ATS.",
      summary: "[CHA-Atitude] O resumo profissional está genérico e não demonstra proposta de valor. Comece com uma métrica de impacto (Ex: '+20 projetos entregues impactando 500K usuários') e mostre atitude proativa.",
      experience: "[TF-IDF] A densidade de termos técnicos está abaixo do esperado. Suas experiências descrevem responsabilidades, não resultados. Use: Verbo de ação + Métrica + Contexto. Ex: 'Reduzi deploy em 70% com CI/CD'.",
      tips: [
        "[NER/ATS] Estrutura limpa no PDF — sem tabelas complexas ou colunas duplas que quebram o parsing",
        "[Skill Graph] Liste Hard Skills do cargo-alvo explicitamente — ATS faz match exato primeiro",
        "[CHA-Habilidade] Reescreva experiências com 'Verbo + Métrica + Contexto'",
        "[TF-IDF] Equilibre frequência de termos técnicos — repetição excessiva = spam para o ATS",
        "[Parsing] Seções claras: Objetivo, Experiência, Formação, Competências — NER precisa identificar blocos",
      ],
    },
  };
}
