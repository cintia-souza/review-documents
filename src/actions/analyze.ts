"use server";

import { prisma } from "@/lib/prisma";
import { analyzeWithAI } from "@/lib/ai";
import { analyzeSchema } from "@/lib/validators";
import { extractTextFromPDF } from "@/lib/pdf";
import { auth } from "@/lib/auth";
import type { AnalysisResult } from "@/types";

interface ActionResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

export async function analyzeProfile(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Faça login para continuar" };
    }

    const raw = {
      type: formData.get("type") as string,
      linkedinUrl: formData.get("linkedinUrl") as string | null,
      fileBase64: formData.get("fileBase64") as string | null,
      fileName: formData.get("fileName") as string | null,
    };

    const cleaned = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== null)
    );

    const parsed = analyzeSchema.parse(cleaned);

    let textToAnalyze: string;

    if (parsed.type === "linkedin_url") {
      textToAnalyze = `Analise o perfil LinkedIn: ${parsed.linkedinUrl}`;
    } else {
      textToAnalyze = await extractTextFromPDF(parsed.fileBase64);
    }

    const { scores, feedback } = await analyzeWithAI(textToAnalyze);

    const analysis = await prisma.profileAnalysis.create({
      data: {
        userId: session.user.id,
        source: parsed.type,
        input:
          parsed.type === "linkedin_url" ? parsed.linkedinUrl : parsed.fileName,
        scores: JSON.parse(JSON.stringify(scores)),
        feedback: JSON.parse(JSON.stringify(feedback)),
      },
    });

    return {
      success: true,
      data: {
        id: analysis.id,
        scores,
        feedback,
        source: parsed.type,
        createdAt: analysis.createdAt.toISOString(),
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}
