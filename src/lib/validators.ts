import { z } from "zod";

const linkedinSchema = z.object({
  type: z.literal("linkedin_url"),
  linkedinUrl: z
    .string()
    .url("URL inválida")
    .refine((url) => url.includes("linkedin.com/in/"), {
      message: "URL deve ser um perfil LinkedIn válido",
    }),
});

const pdfSchema = z.object({
  type: z.literal("pdf_upload"),
  fileBase64: z
    .string()
    .min(1, "Arquivo obrigatório")
    .refine((b64) => b64.length < 10_000_000, {
      message: "Arquivo deve ter no máximo ~7MB",
    }),
  fileName: z
    .string()
    .min(1, "Nome do arquivo obrigatório")
    .refine((name) => name.toLowerCase().endsWith(".pdf"), {
      message: "Apenas PDFs são aceitos",
    }),
});

export const analyzeSchema = z.union([linkedinSchema, pdfSchema]);

export type AnalyzeInput = z.infer<typeof analyzeSchema>;
