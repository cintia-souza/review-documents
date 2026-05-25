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

REGRA CRÍTICA PARA HEADLINE (3-5 keywords):
1. Busque mentalmente as vagas reais do CARGO-ALVO informado pelo usuário
2. Identifique as 5 competências mais pedidas (presentes em 80-90% das vagas)
3. Cruze com as COMPETÊNCIAS DECLARADAS pelo usuário
4. Sugira headline APENAS com keywords que são FREQUENTES NO MERCADO + DOMINADAS PELO USUÁRIO
5. Formato: "Cargo | Skill1 | Skill2 | Skill3"

PONTUAÇÃO: title(0-100,peso35%), summary(0-100,peso25%), experience(0-100,peso40%), overall=title*0.35+summary*0.25+experience*0.40

JSON: {"scores":{"title":N,"summary":N,"experience":N,"overall":N},"feedback":{"title":"[Skill Graph] feedback com sugestão de headline baseada no cruzamento mercado x skills do usuário","summary":"[CHA-Atitude] feedback","experience":"[TF-IDF/CHA-Habilidade] feedback","tips":["5 dicas com tags [Skill Graph],[CHA],[NER/ATS],[TF-IDF],[Parsing]"]}}

Responda APENAS JSON válido.`;

const LINKEDIN_PROMPT = `Você é um especialista no algoritmo do LinkedIn Recruiter.

Analise usando os 4 PILARES DO ALGORITMO:

PILAR 1 - Correspondência Semântica: Headline+Skills+Sobre varridos com buscas booleanas. Título tem MAIOR PESO.
PILAR 2 - Spotlights: Open to Work, Active Talent (30 dias), Engaged with Talent Brand (4x InMail).
PILAR 3 - Conexão/Localidade: Filtro de localização ELIMINATÓRIO. 1º e 2º grau ganham boost.
PILAR 4 - Find Similar: Padrão de carreira (progressão, tempo, faculdade, empresas) = DNA profissional.

REGRA CRÍTICA PARA HEADLINE (3-5 keywords):
1. Busque mentalmente as vagas reais do CARGO-ALVO informado pelo usuário no LinkedIn
2. Identifique as 5 competências mais pedidas (presentes em 80-90% das vagas)
3. Cruze com as COMPETÊNCIAS DECLARADAS pelo usuário
4. Sugira headline APENAS com keywords que são FREQUENTES NO MERCADO + DOMINADAS PELO USUÁRIO
5. Formato: "Cargo | Skill1 | Skill2 | Skill3" (3-5 keywords do cruzamento)

PONTUAÇÃO: title(0-100,peso35%), summary(0-100,peso25%), experience(0-100,peso40%), overall=title*0.35+summary*0.25+experience*0.40

JSON: {"scores":{"title":N,"summary":N,"experience":N,"overall":N},"feedback":{"title":"[Pilar 1] feedback headline com sugestão baseada no cruzamento vagas reais x skills do usuário","summary":"[Pilar 1/2] feedback sobre","experience":"[Pilar 3/4] feedback experiências","tips":["5 dicas com tags [Pilar 1],[Pilar 2],[Pilar 3],[Pilar 4],[Headline],[Auditoria]"]}}

Responda APENAS JSON válido.`;

function buildContext(targetRole: string, userSkills: string): string {
  return `

DADOS DO USUÁRIO:
- Cargo-alvo desejado: ${targetRole}
- Competências que domina: ${userSkills}

INSTRUÇÃO DE CRUZAMENTO:
Analise as vagas reais de "${targetRole}" no mercado. Identifique as 5 competências mais pedidas (80-90% das vagas pedem).
Competências do usuário: ${userSkills}
CRUZE: quais das competências do usuário coincidem com as mais pedidas pelo mercado?
Use APENAS essas no headline sugerido. Se o usuário não tem alguma skill crítica do mercado, aponte como GAP nas dicas.`;
}

export async function analyzeWithAI(text: string, targetRole: string, userSkills: string): Promise<AIAnalysisResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return simulatedLinkedinAnalysis();

  const context = buildContext(targetRole, userSkills);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${LINKEDIN_PROMPT}${context}\n\nPERFIL LINKEDIN:\n${text}` }] }],
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

export async function analyzePDFWithAI(base64: string, targetRole: string, userSkills: string): Promise<AIAnalysisResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return simulatedPDFAnalysis();

  const context = buildContext(targetRole, userSkills);

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
            { text: `${PDF_PROMPT}${context}\n\nAnalise o currículo neste PDF.` },
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
      title: "[Pilar 1] Seu headline não reflete as keywords mais buscadas para o cargo-alvo. Baseado no cruzamento entre vagas reais e suas competências, sugiro: 'Cargo | Skill1 | Skill2 | Skill3' usando apenas skills que você domina E que 90% das vagas pedem.",
      summary: "[Pilar 2] Seu Sobre não tem hook nas primeiras 2 linhas. Comece com métrica de impacto. Ative 'Open to Work' e interaja semanalmente para Active Talent.",
      experience: "[Pilar 4] Experiências não mostram progressão clara. Find Similar prioriza jornadas legíveis. Use: 'Verbo + Métrica + Contexto'.",
      tips: [
        "[Pilar 2] Ative 'Open to Work' (modo oculto) — 3x mais visibilidade no Spotlight",
        "[Pilar 1] Headline deve ter 3-5 keywords do cruzamento mercado x suas skills",
        "[Pilar 4] Progressão clara (Jr → Pleno → Sênior) — Find Similar prioriza padrões legíveis",
        "[Pilar 3] Localização correta + disponibilidade para recolocação — filtro ELIMINATÓRIO",
        "[Auditoria] Skills da seção Competências devem espelhar exatamente o headline",
      ],
    },
  };
}

function simulatedPDFAnalysis(): AIAnalysisResponse {
  return {
    scores: { title: 45, summary: 52, experience: 58, overall: 52 },
    feedback: {
      title: "[Skill Graph] O título/objetivo não reflete o cruzamento entre vagas reais do cargo-alvo e suas competências. Sugira headline com 3-5 keywords que são frequentes no mercado E que você domina.",
      summary: "[CHA-Atitude] Resumo genérico sem proposta de valor. Comece com métrica de impacto e mostre atitude proativa.",
      experience: "[TF-IDF] Densidade de termos técnicos abaixo do esperado. Experiências descrevem responsabilidades, não resultados. Use: Verbo + Métrica + Contexto.",
      tips: [
        "[NER/ATS] Estrutura limpa — sem tabelas complexas ou colunas duplas",
        "[Skill Graph] Liste no currículo as skills do cruzamento mercado x suas competências",
        "[CHA-Habilidade] Reescreva experiências com 'Verbo + Métrica + Contexto'",
        "[TF-IDF] Equilibre frequência de termos — repetição excessiva = spam",
        "[Parsing] Seções claras: Objetivo, Experiência, Formação, Competências",
      ],
    },
  };
}
