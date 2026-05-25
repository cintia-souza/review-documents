"use server";

import { prisma } from "@/lib/prisma";
import { analyzeSchema } from "@/lib/validators";
import { auth } from "@/lib/auth";
import type { AnalysisResult } from "@/types";

interface ActionResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

function getField(formData: FormData, name: string): string | null {
  // Next.js Server Actions can prefix fields with _N_
  const direct = formData.get(name) as string | null;
  if (direct) return direct;

  // Search for prefixed versions
  for (const [key, value] of formData.entries()) {
    if (key.endsWith(`_${name}`) && typeof value === "string") {
      return value;
    }
  }
  return null;
}

export async function analyzeProfile(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Faça login para continuar" };
    }

    const type = getField(formData, "type");
    const linkedinUrl = getField(formData, "linkedinUrl");
    const fileBase64 = getField(formData, "fileBase64");
    const fileName = getField(formData, "fileName");
    const targetRole = getField(formData, "targetRole") ?? "";
    const userSkills = getField(formData, "skills") ?? "";

    const payload: Record<string, string> = {};
    if (type) payload.type = type;
    if (linkedinUrl) payload.linkedinUrl = linkedinUrl;
    if (fileBase64) payload.fileBase64 = fileBase64;
    if (fileName) payload.fileName = fileName;

    const result = analyzeSchema.safeParse(payload);
    if (!result.success) {
      return { success: false, error: result.error.issues[0]?.message ?? "Dados inválidos" };
    }
    const parsed = result.data;

    let analysisResult: { scores: import("@/types").ProfileScores; feedback: import("@/types").ProfileFeedback };

    if (parsed.type === "linkedin_url") {
      const { analyzeWithAI } = await import("@/lib/ai");
      analysisResult = await analyzeWithAI(`Analise o perfil LinkedIn: ${parsed.linkedinUrl}`, targetRole, userSkills);
    } else {
      const { analyzePDFWithAI } = await import("@/lib/ai");
      analysisResult = await analyzePDFWithAI(parsed.fileBase64, targetRole, userSkills);
    }

    const { scores, feedback } = analysisResult;

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
    console.error("[analyzeProfile error]", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return { success: false, error: message };
  }
}
