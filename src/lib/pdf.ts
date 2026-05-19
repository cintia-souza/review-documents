export async function extractTextFromPDF(base64: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Fallback: decode raw text from PDF buffer (basic extraction)
    const buffer = Buffer.from(base64, "base64");
    const rawText = buffer.toString("utf-8");
    // Extract readable text between stream markers
    const textParts = rawText.match(/[\w\s.,;:!?@#$%&*()\-+=\[\]{}'"\/\\<>áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]+/g);
    return (textParts ?? []).join(" ").slice(0, 8000);
  }

  // Use Gemini to extract text from PDF (works in serverless)
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
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: base64,
                },
              },
              {
                text: "Extraia TODO o texto deste PDF de currículo/perfil profissional. Retorne apenas o texto extraído, sem formatação adicional, sem comentários. Mantenha a estrutura original (seções, títulos, datas, etc).",
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
        },
      }),
    }
  );

  if (!response.ok) {
    // Fallback to basic extraction if Gemini fails
    const buffer = Buffer.from(base64, "base64");
    const rawText = buffer.toString("utf-8");
    const textParts = rawText.match(/[\w\s.,;:!?@#$%&*()\-+=\[\]{}'"\/\\<>áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]+/g);
    return (textParts ?? []).join(" ").slice(0, 8000);
  }

  const data = (await response.json()) as {
    candidates: { content: { parts: { text: string }[] } }[];
  };

  return data.candidates[0].content.parts[0].text.slice(0, 8000);
}
