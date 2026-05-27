import type { ProfileScores, ProfileFeedback } from "@/types";

interface AIAnalysisResponse {
  scores: ProfileScores;
  feedback: ProfileFeedback;
}

const GROQ_MODEL = "llama-3.3-70b-versatile";

const PDF_PROMPT = `Você é um sistema especialista em Recrutamento & Seleção e PLN aplicado a currículos.

Analise usando 3 MODELOS: Skill Graph Modeling, Metodologia CHA e NER+TF-IDF.

SKILL GRAPH: Habilidades são teia de conexões. "Next.js" implica React, JS, TS, Front-end. Pontue por proximidade semântica. Identifique GAPS.
CHA: C=Formação/certificações. H=Verbos de ação+métricas. A=Tom da escrita/atitude.
NER+TF-IDF: Parsing em blocos semânticos claros? Densidade de termos técnicos equilibrada?

REGRAS CRÍTICAS PARA HEADLINE (3-5 keywords):
1. O CARGO no headline DEVE ser EXATAMENTE o cargo-alvo informado. NÃO mude para outro cargo.
2. NÃO repita skills do mesmo ecossistema. React/Next.js/TypeScript são a MESMA stack — agrupe como "React/Next.js".
3. PRIORIZE skills COMPLEMENTARES que diferenciam: CI/CD, Testes, Cloud, Design Systems, Performance.
4. NUNCA inclua skills fora do foco do cargo-alvo.
5. Busque competências COMPLEMENTARES mais pedidas nas vagas do cargo (80-90%).
6. Cruze com as competências do usuário. Use APENAS as que ele domina.
7. Formato: "Cargo-alvo | StackPrincipal | Complementar1 | Complementar2 | Complementar3"

PONTUAÇÃO: title(0-100,peso35%), summary(0-100,peso25%), experience(0-100,peso40%), overall=title*0.35+summary*0.25+experience*0.40

Responda APENAS com JSON válido neste formato:
{"scores":{"title":N,"summary":N,"experience":N,"overall":N},"feedback":{"title":"[Skill Graph] feedback","summary":"[CHA-Atitude] feedback","experience":"[TF-IDF/CHA-Habilidade] feedback","tips":["dica1","dica2","dica3","dica4","dica5"]}}`;

const LINKEDIN_PROMPT = `Você é um especialista no algoritmo do LinkedIn Recruiter.

Analise usando os 4 PILARES DO ALGORITMO:

PILAR 1 - Correspondência Semântica: Headline+Skills+Sobre varridos com buscas booleanas. Título tem MAIOR PESO.
PILAR 2 - Spotlights: Open to Work, Active Talent (30 dias), Engaged with Talent Brand (4x InMail).
PILAR 3 - Conexão/Localidade: Filtro de localização ELIMINATÓRIO. 1º e 2º grau ganham boost.
PILAR 4 - Find Similar: Padrão de carreira (progressão, tempo, faculdade, empresas) = DNA profissional.

REGRAS CRÍTICAS PARA HEADLINE (3-5 keywords):
1. O CARGO no headline DEVE ser EXATAMENTE o cargo-alvo informado. NÃO invente outro cargo.
2. NÃO repita skills do mesmo ecossistema. React/Next.js/TypeScript = MESMA stack. Agrupe como "React/Next.js".
3. PRIORIZE skills COMPLEMENTARES que diferenciam: CI/CD, Testes, Cloud, Design Systems, Performance.
4. NUNCA inclua skills fora do foco.
5. Busque competências COMPLEMENTARES mais pedidas nas vagas do cargo (80-90%).
6. Cruze com skills do usuário. Use APENAS as que ele domina.
7. Formato: "Cargo-alvo | StackPrincipal | Complementar1 | Complementar2 | Complementar3"

PONTUAÇÃO: title(0-100,peso35%), summary(0-100,peso25%), experience(0-100,peso40%), overall=title*0.35+summary*0.25+experience*0.40

Responda APENAS com JSON válido neste formato:
{"scores":{"title":N,"summary":N,"experience":N,"overall":N},"feedback":{"title":"[Pilar 1] feedback","summary":"[Pilar 1/2] feedback","experience":"[Pilar 3/4] feedback","tips":["dica1","dica2","dica3","dica4","dica5"]}}`;

function buildContext(targetRole: string, userSkills: string): string {
  if (!targetRole && !userSkills) return "";
  return `

DADOS DO USUÁRIO:
- Cargo-alvo: ${targetRole || "não informado"}
- Competências: ${userSkills || "não informadas"}

INSTRUÇÃO: Busque vagas reais de "${targetRole}". Identifique competências COMPLEMENTARES mais pedidas. Cruze com as do usuário. Headline = cargo-alvo + stack agrupada + 2-3 complementares que ele domina.`;
}

async function callGroq(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Serviço de IA indisponível. Configure a GROQ_API_KEY.");

  const systemMsg = messages.find((m) => m.role === "system");
  const userMsg = messages.find((m) => m.role === "user");

  // Add instruction to never use cached/previous data
  const freshInstruction = "\n\nIMPORTANTE: Esta é uma análise NOVA e INDEPENDENTE. NÃO use informações de análises anteriores. Baseie-se EXCLUSIVAMENTE nos dados fornecidos AGORA nesta mensagem.";

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: (systemMsg?.content ?? "") + freshInstruction },
        { role: "user", content: userMsg?.content ?? "" },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      // Retry after 3 seconds
      await new Promise((r) => setTimeout(r, 3000));
      const retryResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: (systemMsg?.content ?? "") + freshInstruction },
            { role: "user", content: userMsg?.content ?? "" },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: "json_object" },
        }),
      });
      if (!retryResponse.ok) throw new Error("Limite de requisições. Aguarde alguns segundos e tente novamente.");
      const retryData = (await retryResponse.json()) as { choices: { message: { content: string } }[] };
      return retryData.choices[0].message.content;
    }
    throw new Error(`Erro na API de IA: ${response.status}`);
  }

  const data = (await response.json()) as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

export async function analyzeWithAI(text: string, targetRole: string, userSkills: string): Promise<AIAnalysisResponse> {
  const context = buildContext(targetRole, userSkills);
  const content = await callGroq([
    { role: "system", content: LINKEDIN_PROMPT },
    { role: "user", content: `${context}\n\nPERFIL LINKEDIN:\n${text}` },
  ]);
  return JSON.parse(content) as AIAnalysisResponse;
}

export async function analyzePDFWithAI(base64: string, targetRole: string, userSkills: string): Promise<AIAnalysisResponse> {
  const context = buildContext(targetRole, userSkills);
  // Groq doesn't support inline PDF — decode text from base64
  const buffer = Buffer.from(base64, "base64");
  const rawText = buffer.toString("utf-8");
  const textParts = rawText.match(/[\w\s.,;:!?@#$%&*()\-+=\[\]{}'"\/\\<>áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]+/g);
  const pdfText = (textParts ?? []).join(" ").slice(0, 6000);

  const content = await callGroq([
    { role: "system", content: PDF_PROMPT },
    { role: "user", content: `${context}\n\nCURRÍCULO EXTRAÍDO DO PDF:\n${pdfText}` },
  ]);
  return JSON.parse(content) as AIAnalysisResponse;
}
