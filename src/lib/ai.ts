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

async function getMarketContext(targetRole: string): Promise<string> {
  try {
    const { getLatestMarketAnalysis, formatMarketContext } = await import("@/lib/linkedin/market");
    // Mapeia cargo-alvo para searchTag
    const tag = targetRole.toLowerCase().includes("front") ? "front-end" :
                targetRole.toLowerCase().includes("back") ? "back-end" : "front-end";
    const analysis = await getLatestMarketAnalysis(tag);
    if (analysis) return formatMarketContext(analysis);
  } catch {}
  return "";
}

export async function analyzeWithAI(text: string, targetRole: string, userSkills: string): Promise<AIAnalysisResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Serviço de IA indisponível. Configure a GEMINI_API_KEY.");

  const context = buildContext(targetRole, userSkills);
  const marketContext = await getMarketContext(targetRole);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${LINKEDIN_PROMPT}${context}${marketContext}\n\nPERFIL LINKEDIN:\n${text}` }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 429) throw new Error("Limite de requisições atingido. Aguarde 1 minuto e tente novamente.");
    throw new Error(`Erro na API de IA: ${response.status}`);
  }

  const data = (await response.json()) as { candidates: { content: { parts: { text: string }[] } }[] };
  return JSON.parse(data.candidates[0].content.parts[0].text) as AIAnalysisResponse;
}

export async function analyzePDFWithAI(base64: string, targetRole: string, userSkills: string): Promise<AIAnalysisResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Serviço de IA indisponível. Configure a GEMINI_API_KEY.");

  const context = buildContext(targetRole, userSkills);
  const marketContext = await getMarketContext(targetRole);
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
            { text: `${PDF_PROMPT}${context}${marketContext}\n\nAnalise o currículo neste PDF.` },
          ],
        }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 429) throw new Error("Limite de requisições atingido. Aguarde 1 minuto e tente novamente.");
    throw new Error(`Erro na API de IA: ${response.status}`);
  }

  const data = (await response.json()) as { candidates: { content: { parts: { text: string }[] } }[] };
  return JSON.parse(data.candidates[0].content.parts[0].text) as AIAnalysisResponse;
}
