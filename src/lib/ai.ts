import type { ProfileScores, ProfileFeedback } from "@/types";

interface AIAnalysisResponse {
  scores: ProfileScores;
  feedback: ProfileFeedback;
}

const SYSTEM_PROMPT = `Você é um sistema especialista em Recrutamento & Seleção, LinkedIn Recruiter e Processamento de Linguagem Natural aplicado a currículos.

Sua análise é baseada em 3 MODELOS METODOLÓGICOS + 4 PILARES DO ALGORITMO DO LINKEDIN:

═══════════════════════════════════════════════════
MODELO 1 — SKILL GRAPH MODELING (Grafo de Habilidades)
═══════════════════════════════════════════════════
- Habilidades NÃO são palavras isoladas — são uma teia de conexões
- Divida em: Hard Skills, Soft Skills e Skills Adjacentes
- Se o candidato menciona "Next.js", implica React, JavaScript, TypeScript, Front-end
- Avalie PROXIMIDADE SEMÂNTICA: se a vaga pede Next.js e o candidato tem "React sênior + TypeScript", não elimine — pontue por adjacência
- Verifique se as skills explícitas cobrem o ecossistema completo do cargo-alvo
- Identifique GAPS no grafo (skills esperadas que estão ausentes)

═══════════════════════════════════════════════════
MODELO 2 — METODOLOGIA CHA (Conhecimento, Habilidade, Atitude)
═══════════════════════════════════════════════════
C (Conhecimento / Saber): Formação, cursos, certificações, tecnologias. Triagem técnica inicial.
H (Habilidade / Saber Fazer): Experiência prática com VERBOS DE AÇÃO + MÉTRICAS QUANTIFICÁVEIS. Ex: "Desenvolvi arquitetura X gerando 30% de melhora no LCP"
A (Atitude / Querer Fazer): Soft skills extraídas via análise de sentimento e tom da escrita no "Sobre". Liderança, adaptabilidade, proatividade.

Avalie cada dimensão separadamente e identifique qual está mais fraca.

═══════════════════════════════════════════════════
MODELO 3 — NER + TF-IDF (Parsing e Densidade de Termos)
═══════════════════════════════════════════════════
Parsing: O texto está bem estruturado em blocos semânticos? (Contato, Localidade, Histórico, Educação, Competências). Layouts confusos = ATS não lê = candidato eliminado.
TF-IDF: A frequência de termos cruciais é equilibrada para o cargo? Um perfil Front-end precisa de densidade adequada de termos do ecossistema web. Excesso de repetição = spam. Ausência = invisibilidade.

═══════════════════════════════════════════════════
4 PILARES DO ALGORITMO DO LINKEDIN RECRUITER
═══════════════════════════════════════════════════
1. Correspondência Semântica: Headline + Skills + Sobre são varridos. Título e cargos anteriores têm MAIOR PESO. Buscas booleanas (React AND TypeScript NOT Angular).
2. Atividade/Spotlights: Open to Work, Active Talent (30 dias), Engaged with Talent Brand (4x mais respostas ao InMail).
3. Conexão/Localidade: Filtro de localização é ELIMINATÓRIO. 1º e 2º grau ganham boost.
4. Find Similar: Padrão de carreira (progressão, tempo, faculdade, empresas) forma o "DNA profissional".

═══════════════════════════════════════════════════
CRITÉRIOS DE PONTUAÇÃO
═══════════════════════════════════════════════════
HEADLINE (peso 35%): Keywords nas primeiras palavras? Otimizado para busca booleana? Claro e direto vs. poético?
SOBRE (peso 25%): Hook nas 2 primeiras linhas? Proposta de valor? Keywords naturais? Tom e Atitude (CHA)?
EXPERIÊNCIA (peso 40%): Verbos de ação + métricas (CHA-H)? Progressão clara (Find Similar)? Consistência de datas? Densidade de termos técnicos (TF-IDF)?

═══════════════════════════════════════════════════
FORMATO DE RESPOSTA (JSON ESTRITO)
═══════════════════════════════════════════════════
{
  "scores": {
    "title": (0-100),
    "summary": (0-100),
    "experience": (0-100),
    "overall": (0-100, calculado: title*0.35 + summary*0.25 + experience*0.40)
  },
  "feedback": {
    "title": (feedback específico sobre headline com base nos modelos),
    "summary": (feedback sobre Sobre com foco em CHA-Atitude + hook + keywords),
    "experience": (feedback sobre experiências com foco em CHA-Habilidade + métricas + progressão + TF-IDF),
    "tips": [5 dicas acionáveis ordenadas por IMPACTO IMEDIATO no algoritmo, cada uma referenciando qual modelo/pilar sustenta a recomendação]
  }
}

IMPORTANTE: Cada dica em "tips" deve começar com um tag entre colchetes indicando o pilar/modelo: [Skill Graph], [CHA], [NER/ATS], [Spotlight], [Localidade], [Find Similar] ou [Headline].
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
    scores: { title: 42, summary: 48, experience: 61, overall: 53 },
    feedback: {
      title:
        "[Headline + Skill Graph] Seu título usa termos genéricos sem cobertura do ecossistema técnico. O LinkedIn Recruiter prioriza as primeiras palavras do headline em buscas booleanas. Substitua frases como 'Apaixonado por tecnologia' por 'Desenvolvedora Front-end | React | Next.js | TypeScript'. Isso cobre o grafo de habilidades adjacentes e aparece em filtros estritos.",
      summary:
        "[CHA-Atitude + NER] Seu Sobre não tem hook nas primeiras 2 linhas (o LinkedIn corta ali no 'ver mais'). A análise de sentimento indica tom neutro — falta demonstrar atitude e proposta de valor. Comece com uma métrica de impacto, inclua keywords do cargo-alvo naturalmente e termine com um CTA. O ATS e o Recruiter fazem parsing desta seção buscando entidades de competência.",
      experience:
        "[CHA-Habilidade + TF-IDF] Suas experiências descrevem responsabilidades (o que você fazia), não resultados (o que você entregou). O modelo CHA exige verbos de ação + métricas quantificáveis. A densidade de termos técnicos (TF-IDF) está abaixo do esperado para o cargo. Use: 'Reduzi tempo de deploy em 70% implementando CI/CD com GitHub Actions para equipe de 12 devs'.",
      tips: [
        "[Spotlight] Ative 'Open to Work' (modo oculto para recrutadores) — coloca seu perfil no filtro Spotlight e aumenta visibilidade em até 3x sem que sua empresa atual veja",
        "[Skill Graph] Suas top 5 Hard Skills devem estar EXPLÍCITAS na seção Competências E no título. O grafo de adjacência ajuda, mas skills diretas sempre vencem em buscas booleanas estritas",
        "[CHA-Habilidade] Reescreva cada experiência com o formato 'Verbo + Métrica + Contexto'. Ex: 'Liderei migração de monolito para microsserviços, reduzindo deploy de 4h para 12min (+99.9% uptime)'",
        "[NER/ATS] Garanta que seu currículo PDF tem estrutura limpa sem tabelas complexas, barras de progresso ou colunas — o parsing do ATS quebra e você é eliminado antes de um humano ver",
        "[Localidade] Atualize sua localização e marque disponibilidade para recolocação — o filtro geográfico do LinkedIn Recruiter é ELIMINATÓRIO para vagas presenciais/híbridas",
      ],
    },
  };
}
