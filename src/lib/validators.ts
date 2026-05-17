import { z } from "zod";

export const analyzeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("linkedin_url"),
    linkedinUrl: z
      .string()
      .url()
      .refine((url) => url.includes("linkedin.com/in/"), {
        message: "URL deve ser um perfil LinkedIn válido",
      }),
  }),
  z.object({
    type: z.literal("pdf_upload"),
    fileBase64: z
      .string()
      .min(1)
      .refine((b64) => b64.length < 5_000_000, {
        message: "Arquivo deve ter no máximo ~3.5MB",
      }),
    fileName: z.string().endsWith(".pdf", { message: "Apenas PDFs são aceitos" }),
  }),
]);

export type AnalyzeInput = z.infer<typeof analyzeSchema>;
