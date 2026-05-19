import type { ProfileScores, ProfileFeedback } from "@/types";

interface AIAnalysisResponse {
  scores: ProfileScores;
  feedback: ProfileFeedback;
}

const SYSTEM_PROMPT = `Você é um especialista em recrutamento técnico, LinkedIn Recruiter e branding pessoal.

Analise o perfil/currículo com base nos 4 PILARES DO ALGORITMO DO LINKEDIN RECRUITER:

## PILAR 1 — Correspondência Semântica e Palavras-Chave
- O LinkedIn Recruiter varre Título (Headline), Sobre (Summary) e Competências (Skills)
- O título e cargos anteriores têm MAIOR PESO
- Recrutadores usam buscas booleanas (Ex: "React AND TypeScript NOT Angular")
- O algoritmo agrupa sinônimos, mas skills explícitas sempre vencem
- Verifique se as Hard Skills do cargo-alvo estão nas 5 principais competências

## PILAR 2 — Atividade e Disponibilidade (Spotlights)
- O algoritmo prioriza quem demonstra probabilidade de responder
- "Open to Work" (público ou oculto) aumenta visibilidade drasticamente
- "Active Talent": interações nos últimos 30 dias
- Seguir empresas-alvo aumenta taxa de resposta ao InMail em até 4x

## PILAR 3 — Grau de Conexão e Localidade
- Candidatos de 1º e 2º grau ganham boost no ranking
- Filtro de localização é EXTREMAMENTE rígido para vagas presenciais/híbridas
- Marcar disponibilidade para recolocação é essencial

## PILAR 4 — IA Generativa e "Find Similar"
- O LinkedIn usa "Find Similar Candidates" baseado em padrões de carreira
- Tempo de casa, faculdade, ordem de empresas, skills formam o "DNA profissional"
- Perfis com jornada clara e progressiva são priorizados

## CRITÉRIOS DE AVALIAÇÃO:
A) Auditoria de Keywords: As Hard Skills do cargo-alvo estão explícitas no título e competências?
B) Otimização do Headline: Título é claro, direto e com palavras-chave nas primeiras posições? (evitar frases poéticas)
C) Consistência: Datas, cargos e empresas são consistentes e progressivos?
D) Engajamento: Há sinais de atividade e disponibilidade?

## FORMATO DE RESPOSTA (JSON):
{
  "scores": {
    "title": (0-100, peso no headline e keywords),
    "summary": (0-100, peso na seção Sobre e storytelling profissional),
    "experience": (0-100, peso na progressão, métricas e consistência),
    "overall": (0-100, média ponderada: title 35%, summary 25%, experience 40%)
  },
  "feedback": {
    "title": (dica específica sobre o headline baseada nos pilares),
    "summary": (dica sobre o Sobre com foco em hook + keywords + proposta de valor),
    "experience": (dica sobre experiências com foco em métricas, verbos de ação e progressão),
    "tips": [5 dicas acionáveis baseadas nos 4 pilares, priorizando o que dará mais resultado imediato no algoritmo]
  }
}

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
          { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nPERFIL/CURRÍCULO PARA ANÁLISE:\n${text}` }] },
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
    scores: { title: 45, summary: 52, experience: 68, overall: 56 },
    feedback: {
      title:
        "Seu headline usa termos genéricos que não aparecem em buscas booleanas. Recrutadores buscam 'React Developer | TypeScript | Next.js', não 'Apaixonado por tecnologia'. Coloque suas 3 principais Hard Skills nas primeiras palavras do título.",
      summary:
        "Seu Sobre não tem hook nas primeiras 2 linhas (o LinkedIn corta ali). Comece com uma métrica de impacto ou proposta de valor direta. Inclua as keywords do cargo-alvo naturalmente no texto para o algoritmo de busca semântica captar.",
      experience:
        "Suas experiências descrevem responsabilidades, não resultados. O algoritmo 'Find Similar' prioriza progressão clara. Use formato: 'Verbo de ação + métrica + contexto' (Ex: 'Reduzi tempo de deploy em 70% implementando CI/CD com GitHub Actions').",
      tips: [
        "Ative 'Open to Work' (modo oculto para recrutadores) — isso coloca seu perfil no filtro Spotlight e aumenta visibilidade em até 3x",
        "Adicione suas top 5 Hard Skills na seção Competências E no título — recrutadores usam filtros booleanos estritos",
        "Siga as empresas-alvo e interaja com posts delas — o algoritmo prioriza candidatos 'Engaged with Talent Brand'",
        "Atualize seu perfil semanalmente (mesmo que mínimo) — o filtro 'Active Talent' considera atividade nos últimos 30 dias",
        "Garanta que localização está correta e marque disponibilidade para recolocação — o filtro de localidade é eliminatório",
      ],
    },
  };
}
