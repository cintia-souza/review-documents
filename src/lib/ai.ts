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

const FRESH_INSTRUCTION = "\n\nIMPORTANTE: Esta é uma análise NOVA e INDEPENDENTE. NÃO use informações de análises anteriores. Baseie-se EXCLUSIVAMENTE nos dados fornecidos AGORA nesta mensagem.";

async function callGroq(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Serviço de IA indisponível. Configure a GROQ_API_KEY.");

  const messages = [
    { role: "system", content: systemPrompt + FRESH_INSTRUCTION },
    { role: "user", content: userContent },
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      await new Promise((r) => setTimeout(r, 3000));
      const retry = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7, max_tokens: 4000, response_format: { type: "json_object" } }),
      });
      if (!retry.ok) throw new Error("Limite de requisições. Aguarde alguns segundos e tente novamente.");
      const retryData = (await retry.json()) as { choices: { message: { content: string } }[] };
      return retryData.choices[0].message.content;
    }
    throw new Error(`Erro na API de IA: ${response.status} - ${await response.text().catch(() => "")}`);
  }

  const data = (await response.json()) as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

async function extractTextFromPDF(base64: string): Promise<string> {
  // Try Gemini first (supports inline PDF natively)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [
                { inlineData: { mimeType: "application/pdf", data: base64 } },
                { text: "Extraia TODO o texto deste PDF de currículo profissional. Retorne apenas o texto extraído mantendo a estrutura (seções, títulos, datas). Sem comentários adicionais." },
              ],
            }],
            generationConfig: { temperature: 0.1 },
          }),
        }
      );
      if (response.ok) {
        const data = (await response.json()) as { candidates: { content: { parts: { text: string }[] } }[] };
        const text = data.candidates[0].content.parts[0].text;
        if (text && text.length > 50) return text.slice(0, 4000);
      }
    } catch {
      // Gemini failed, try fallback
    }
  }

  // Fallback: basic regex extraction
  const buffer = Buffer.from(base64, "base64");
  const rawText = buffer.toString("latin1");
  const matches = rawText.match(/\(([^)]+)\)/g);
  if (matches && matches.length > 10) {
    const extracted = matches.map((m) => m.slice(1, -1)).join(" ");
    if (extracted.length > 100) return extracted.slice(0, 4000);
  }

  throw new Error("Não foi possível extrair texto do PDF. Tente exportar novamente pelo LinkedIn (Perfil → Mais → Salvar como PDF).");
}

export async function analyzeWithAI(text: string, targetRole: string, userSkills: string): Promise<AIAnalysisResponse> {
  const context = buildContext(targetRole, userSkills);
  const content = await callGroq(LINKEDIN_PROMPT, `${context}\n\nPERFIL LINKEDIN:\n${text}`);
  return JSON.parse(content) as AIAnalysisResponse;
}

export async function analyzePDFWithAI(base64: string, targetRole: string, userSkills: string): Promise<AIAnalysisResponse> {
  const context = buildContext(targetRole, userSkills);
  const pdfText = await extractTextFromPDF(base64);
  const content = await callGroq(PDF_PROMPT, `${context}\n\nCURRÍCULO EXTRAÍDO DO PDF:\n${pdfText}`);
  return JSON.parse(content) as AIAnalysisResponse;
}
