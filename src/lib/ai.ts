import type { ProfileScores, ProfileFeedback } from "@/types";

interface AIAnalysisResponse {
  scores: ProfileScores;
  feedback: ProfileFeedback;
}

const SYSTEM_PROMPT = `Você é um especialista em recrutamento técnico e branding pessoal no LinkedIn.
Analise o perfil/currículo fornecido e retorne um JSON com:
- scores: { title (0-100), summary (0-100), experience (0-100), overall (0-100) }
- feedback: { title (dica), summary (dica), experience (dica), tips (array de 3-5 dicas acionáveis) }
Responda APENAS com JSON válido, sem markdown.`;

export async function analyzeWithAI(text: string): Promise<AIAnalysisResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return simulatedAnalysis();
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n${text}` }] },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      // Rate limit — usa análise simulada como fallback
      return simulatedAnalysis();
    }
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates: { content: { parts: { text: string }[] } }[];
  };

  const raw = data.candidates[0].content.parts[0].text;
  return JSON.parse(raw) as AIAnalysisResponse;
}

function simulatedAnalysis(): AIAnalysisResponse {
  return {
    scores: { title: 72, summary: 58, experience: 81, overall: 70 },
    feedback: {
      title:
        "Seu título é funcional, mas genérico. Adicione sua proposta de valor única e palavras-chave do setor.",
      summary:
        "O resumo precisa de um hook mais forte nas primeiras 2 linhas. Inclua métricas de impacto.",
      experience:
        "Boas descrições, mas faltam números concretos. Quantifique resultados sempre que possível.",
      tips: [
        "Use palavras-chave do setor no título para aparecer em buscas",
        "Adicione pelo menos 3 competências validadas por colegas",
        "Publique conteúdo semanalmente para aumentar visibilidade",
        "Peça recomendações de gestores e colegas diretos",
      ],
    },
  };
}
