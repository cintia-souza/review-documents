"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

interface AuthResponse {
  success: boolean;
  error?: string;
}

export async function registerUser(formData: FormData): Promise<AuthResponse> {
  try {
    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { name, email, password } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return { success: false, error: "Este email já está cadastrado" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao criar conta. Tente novamente." };
  }
}
