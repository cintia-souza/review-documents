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

REGRAS CRÍTICAS PARA HEADLINE (3-5 keywords):
1. O CARGO no headline DEVE ser EXATAMENTE o cargo-alvo informado. NÃO mude para outro cargo.
2. NÃO repita skills do mesmo ecossistema. React/Next.js/TypeScript são a MESMA stack — escolha apenas 1 para representar (agrupe como "React/Next.js").
3. PRIORIZE skills COMPLEMENTARES que diferenciam: CI/CD, Testes, Cloud, Design Systems, Performance, Acessibilidade.
4. NUNCA inclua skills fora do foco do cargo-alvo. Se o foco é Front-end, NÃO coloque Node.js/Back-end.
5. Busque as competências COMPLEMENTARES mais pedidas nas vagas do cargo (80-90% pedem).
6. Cruze com as competências do usuário. Use APENAS as que ele domina.
7. Formato: "Cargo-alvo | StackPrincipal | Complementar1 | Complementar2 | Complementar3"
   Ex Front-end: "Desenvolvedora Front-end | React/Next.js | CI/CD | Design Systems | AWS"

PONTUAÇÃO: title(0-100,peso35%), summary(0-100,peso25%), experience(0-100,peso40%), overall=title*0.35+summary*0.25+experience*0.40

JSON: {"scores":{"title":N,"summary":N,"experience":N,"overall":N},"feedback":{"title":"[Skill Graph] feedback com headline sugerido seguindo as regras","summary":"[CHA-Atitude] feedback","experience":"[TF-IDF/CHA-Habilidade] feedback","tips":["5 dicas com tags [Skill Graph],[CHA],[NER/ATS],[TF-IDF],[Parsing]"]}}

Responda APENAS JSON válido.`;

const LINKEDIN_PROMPT = `Você é um especialista no algoritmo do LinkedIn Recruiter.

Analise usando os 4 PILARES DO ALGORITMO:

PILAR 1 - Correspondência Semântica: Headline+Skills+Sobre varridos com buscas booleanas. Título tem MAIOR PESO.
PILAR 2 - Spotlights: Open to Work, Active Talent (30 dias), Engaged with Talent Brand (4x InMail).
PILAR 3 - Conexão/Localidade: Filtro de localização ELIMINATÓRIO. 1º e 2º grau ganham boost.
PILAR 4 - Find Similar: Padrão de carreira (progressão, tempo, faculdade, empresas) = DNA profissional.

REGRAS CRÍTICAS PARA HEADLINE (3-5 keywords):
1. O CARGO no headline DEVE ser EXATAMENTE o cargo-alvo informado. NÃO invente outro cargo.
2. NÃO repita skills do mesmo ecossistema. React/Next.js/TypeScript = MESMA stack. Escolha 1 só (agrupe como "React/Next.js").
3. PRIORIZE skills COMPLEMENTARES que diferenciam: CI/CD, Testes, Cloud, Design Systems, Performance, Acessibilidade.
4. NUNCA inclua skills fora do foco. Se foco é Front-end, NÃO coloque Node.js, Python, Back-end.
5. Busque as competências COMPLEMENTARES mais pedidas nas vagas do cargo (80-90%).
6. Cruze com skills do usuário. Use APENAS as que ele domina.
7. Formato: "Cargo-alvo | StackPrincipal | Complementar1 | Complementar2 | Complementar3"
   Ex Front-end: "Desenvolvedora Front-end | React/Next.js | CI/CD | Design Systems | AWS"

PONTUAÇÃO: title(0-100,peso35%), summary(0-100,peso25%), experience(0-100,peso40%), overall=title*0.35+summary*0.25+experience*0.40

JSON: {"scores":{"title":N,"summary":N,"experience":N,"overall":N},"feedback":{"title":"[Pilar 1] feedback com headline sugerido seguindo as regras","summary":"[Pilar 1/2] feedback sobre","experience":"[Pilar 3/4] feedback experiências","tips":["5 dicas com tags [Pilar 1],[Pilar 2],[Pilar 3],[Pilar 4],[Headline],[Auditoria]"]}}

Responda APENAS JSON válido.`;

function buildContext(targetRole: string, userSkills: string): string {
  if (!targetRole && !userSkills) return "";
  return `

DADOS DO USUÁRIO:
- Cargo-alvo: ${targetRole || "não informado"}
- Competências: ${userSkills || "não informadas"}

INSTRUÇÃO: Busque vagas reais de "${targetRole}". Identifique competências COMPLEMENTARES mais pedidas (não a stack principal, que é óbvia). Cruze com as do usuário. Headline = cargo-alvo + stack agrupada + 2-3 complementares que ele domina.`;
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
      title: "[Pilar 1] Seu headline não segue o padrão ideal. Use: 'Cargo-alvo | Stack Principal | Complementar1 | Complementar2'. NÃO repita skills do mesmo ecossistema (React/Next.js/TS = 1 só). Priorize diferenciais complementares como CI/CD, Design Systems, AWS.",
      summary: "[Pilar 2] Sobre sem hook nas primeiras 2 linhas. Comece com métrica de impacto. Ative 'Open to Work' para Spotlight.",
      experience: "[Pilar 4] Experiências sem progressão clara. Find Similar prioriza jornadas legíveis. Use: 'Verbo + Métrica + Contexto'.",
      tips: [
        "[Headline] Agrupe stack principal (React/Next.js) como 1 item e use os slots restantes para complementares",
        "[Pilar 2] Ative 'Open to Work' (modo oculto) — 3x mais visibilidade",
        "[Pilar 1] Skills da seção Competências devem espelhar o headline",
        "[Pilar 3] Localização correta + disponibilidade para recolocação",
        "[Pilar 4] Progressão clara nas experiências (Jr → Pleno → Sênior)",
      ],
    },
  };
}

function simulatedPDFAnalysis(): AIAnalysisResponse {
  return {
    scores: { title: 45, summary: 52, experience: 58, overall: 52 },
    feedback: {
      title: "[Skill Graph] Headline deve ser: 'Cargo-alvo | Stack agrupada | Complementar1 | Complementar2'. Não repita ecossistema (React/Next.js/TS conta como 1). Priorize diferenciais: CI/CD, Testes, Cloud, Design Systems.",
      summary: "[CHA-Atitude] Resumo genérico. Comece com métrica de impacto e proposta de valor clara.",
      experience: "[TF-IDF] Densidade de termos complementares baixa. Experiências descrevem responsabilidades, não resultados. Use: Verbo + Métrica + Contexto.",
      tips: [
        "[Skill Graph] Agrupe React/Next.js/TypeScript como 1 item no headline — use slots para CI/CD, AWS, Design Systems",
        "[NER/ATS] Estrutura limpa no PDF — sem tabelas complexas",
        "[CHA-Habilidade] Reescreva experiências com 'Verbo + Métrica + Contexto'",
        "[TF-IDF] Inclua termos complementares que 90% das vagas pedem",
        "[Parsing] Seções claras: Objetivo, Experiência, Formação, Competências",
      ],
    },
  };
}
