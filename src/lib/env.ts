import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL inválida"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET muito curto"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID obrigatório"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET obrigatório"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL inválida"),
  // Optional
  GEMINI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PREMIUM_PRICE_ID: z.string().optional(),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Variáveis de ambiente inválidas:");
    result.error.issues.forEach((issue) => {
      console.error(`   ${issue.path.join(".")}: ${issue.message}`);
    });
    throw new Error("Variáveis de ambiente inválidas. Verifique o .env");
  }
  return result.data;
}
