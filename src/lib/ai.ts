import type { ProfileScores, ProfileFeedback } from "@/types";

interface AIAnalysisResponse {
  scores: ProfileScores;
  feedback: ProfileFeedback;
}

// ═══════════════════════════════════════════════════
// PROMPT PARA ANÁLISE DE CURRÍCULO (PDF)
// Baseado em: Skill Graph + CHA + NER/TF-IDF
// ═══════════════════════════════════════════════════
const PDF_PROMPT = `Você é um sistema especialista em Recrutamento & Seleção e Processamento de Linguagem Natural aplicado a currículos.

Analise este currículo usando 3 MODELOS METODOLÓGICOS:

## MODELO 1 — SKILL GRAPH MODELING
- Habilidades são uma TEIA de conexões (não palavras isoladas)
- Divida em: Hard Skills, Soft Skills e Skills Adjacentes
- Se menciona "Next.js" → implica React, JavaScript, TypeScript, Front-end
- Pontue por PROXIMIDADE SEMÂNTICA entre skills declaradas e skills do mercado
- Identifique GAPS no grafo (skills esperadas ausentes para o cargo-alvo)

## MODELO 2 — METODOLOGIA CHA (Scott B. Parry)
C (Conhecimento/Saber): Formação, cursos, certificações, tecnologias. Triagem técnica.
H (Habilidade/Saber Fazer): Verbos de ação + métricas quantificáveis. Ex: "Reduzi deploy de 4h para 12min"
A (Atitude/Querer Fazer): Tom da escrita, liderança, adaptabilidade. Análise de sentimento.

## MODELO 3 — NER + TF-IDF (Parsing e Densidade)
Parsing: O documento está em blocos semânticos claros? (Contato, Histórico, Educação, Competências). Layouts confusos = ATS não lê = eliminação.
TF-IDF: Frequência de termos técnicos equilibrada para o cargo? Excesso = spam. Ausência = invisibilidade.

## PONTUAÇÃO
- title (0-100): Headline/título profissional — keywords claras? Cargo + skills nas primeiras palavras?
- summary (0-100): Resumo/objetivo — hook forte? Proposta de valor? Keywords naturais?
- experience (0-100): Experiências — verbos de ação + métricas? Progressão? Densidade TF-IDF?
- overall (0-100): title*0.35 + summary*0.25 + experience*0.40

## FORMATO JSON ESTRITO
{
  "scores": { "title": N, "summary": N, "experience": N, "overall": N },
  "feedback": {
    "title": "feedback sobre headline/título com base no Skill Graph e NER",
    "summary": "feedback sobre resumo com foco em CHA-Atitude + parsing + keywords",
    "experience": "feedback sobre experiências com foco em CHA-Habilidade + métricas + TF-IDF",
    "tips": ["5 dicas acionáveis, cada uma com tag: [Skill Graph], [CHA], [NER/ATS], [TF-IDF] ou [Parsing]"]
  }
}

Responda APENAS com JSON válido.`;

// ═══════════════════════════════════════════════════
// PROMPT PARA ANÁLISE DE PERFIL LINKEDIN (URL)
// Baseado em: 4 Pilares do Algoritmo do LinkedIn Recruiter
// ═══════════════════════════════════════════════════
const LINKEDIN_PROMPT = `Você é um especialista no algoritmo do LinkedIn Recruiter, Semantic Search e Machine Learning Adaptativo.

Analise este perfil LinkedIn usando os 4 PILARES DO ALGORITMO DO RECRUITER:

## PILAR 1 — Correspondência Semântica e Palavras-Chave
- O Recruiter varre Headline, Sobre e Competências com buscas booleanas (React AND TypeScript NOT Angular)
- Título e cargos anteriores têm MAIOR PESO
- O algoritmo agrupa sinônimos: "Front-End Developer" = "React Engineer" = "Desenvolvedor Web" (se skills suportam)
- Verifique: as Hard Skills do cargo-alvo estão EXPLÍCITAS nas 5 principais competências?

## PILAR 2 — Atividade e Disponibilidade (Spotlights)
- Open to Work (público ou oculto) aumenta visibilidade 3x
- Active Talent: interações nos últimos 30 dias
- Engaged with Talent Brand: seguir empresas-alvo = 4x mais respostas ao InMail
- Recomende ações para ativar cada Spotlight

## PILAR 3 — Grau de Conexão e Localidade
- 1º e 2º grau ganham boost no ranking
- Filtro de localização é ELIMINATÓRIO para vagas presenciais/híbridas
- Verificar se localização está correta e se marcou disponibilidade para recolocação

## PILAR 4 — IA Generativa e "Find Similar"
- O Recruiter usa "Find Similar Candidates" baseado em padrões de carreira
- Tempo de casa, faculdade, ordem de empresas, skills = "DNA profissional"
- Perfis com jornada clara e progressiva são priorizados
- Avalie se a progressão de carreira é legível pelo algoritmo

## AUDITORIA ESPECÍFICA
A. Keywords: Skills do cargo-alvo estão na seção Competências E no título?
B. Headline: Primeiras palavras são keywords? Direto vs. poético?
C. Consistência: Datas, cargos e empresas são consistentes e progressivos?

## PONTUAÇÃO
- title (0-100, peso 35%): Headline otimizado para buscas booleanas?
- summary (0-100, peso 25%): Sobre com hook + keywords + proposta de valor?
- experience (0-100, peso 40%): Progressão clara + métricas + consistência?
- overall (0-100): title*0.35 + summary*0.25 + experience*0.40

## FORMATO JSON ESTRITO
{
  "scores": { "title": N, "summary": N, "experience": N, "overall": N },
  "feedback": {
    "title": "feedback sobre headline baseado nos Pilares 1 e 4",
    "summary": "feedback sobre Sobre baseado nos Pilares 1 e 2",
    "experience": "feedback sobre experiências baseado nos Pilares 3 e 4",
    "tips": ["5 dicas acionáveis ordenadas por IMPACTO IMEDIATO, cada uma com tag: [Pilar 1], [Pilar 2], [Pilar 3], [Pilar 4], [Headline] ou [Auditoria]"]
  }
}

Responda APENAS com JSON válido.`;

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
          { role: "user", parts: [{ text: `${LINKEDIN_PROMPT}\n\nPERFIL LINKEDIN PARA ANÁLISE:\n${text}` }] },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 429) return simulatedAnalysis();
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates: { content: { parts: { text: string }[] } }[];
  };

  return JSON.parse(data.candidates[0].content.parts[0].text) as AIAnalysisResponse;
}

export async function analyzePDFWithAI(base64: string): Promise<AIAnalysisResponse> {
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
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: "application/pdf", data: base64 } },
              { text: PDF_PROMPT + "\n\nAnalise o currículo contido neste PDF." },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 429) return simulatedAnalysis();
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates: { content: { parts: { text: string }[] } }[];
  };

  return JSON.parse(data.candidates[0].content.parts[0].text) as AIAnalysisResponse;
}

function simulatedAnalysis(): AIAnalysisResponse {
  return {
    scores: { title: 42, summary: 48, experience: 61, overall: 53 },
    feedback: {
      title:
        "Seu headline usa termos genéricos que não aparecem em buscas booleanas. Recrutadores buscam 'React Developer | TypeScript | Next.js', não frases motivacionais. Coloque suas 3 principais Hard Skills nas primeiras palavras do título.",
      summary:
        "Seu Sobre não tem hook nas primeiras 2 linhas (o LinkedIn corta ali). Comece com uma métrica de impacto ou proposta de valor direta. Inclua as keywords do cargo-alvo naturalmente no texto.",
      experience:
        "Suas experiências descrevem responsabilidades, não resultados. Use formato: 'Verbo de ação + métrica + contexto' (Ex: 'Reduzi tempo de deploy em 70% implementando CI/CD com GitHub Actions').",
      tips: [
        "[Pilar 2] Ative 'Open to Work' (modo oculto para recrutadores) — coloca seu perfil no filtro Spotlight e aumenta visibilidade em até 3x",
        "[Skill Graph] Suas top 5 Hard Skills devem estar EXPLÍCITAS na seção Competências E no título — buscas booleanas estritas exigem match direto",
        "[CHA] Reescreva cada experiência com 'Verbo + Métrica + Contexto'. Ex: 'Liderei migração para microsserviços, reduzindo deploy de 4h para 12min'",
        "[NER/ATS] Garanta estrutura limpa no currículo — sem tabelas complexas, barras de progresso ou colunas que quebram o parsing do ATS",
        "[Pilar 3] Atualize localização e marque disponibilidade para recolocação — filtro geográfico é ELIMINATÓRIO",
      ],
    },
  };
}
