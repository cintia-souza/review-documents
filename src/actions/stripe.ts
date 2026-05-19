"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface StripeResponse {
  success: boolean;
  error?: string;
  url?: string;
}

export async function createCheckoutSession(): Promise<StripeResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Faça login para continuar" };
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { success: false, error: "Usuário não encontrado" };

    if (user.plan === "PREMIUM") {
      redirect("/dashboard");
    }

    // Check if Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;

    if (!stripeKey || !priceId || priceId === "price_...") {
      return {
        success: false,
        error: "Sistema de pagamento em configuração. Tente novamente em breve.",
      };
    }

    const { stripe, PLANS } = await import("@/lib/stripe");

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: "subscription",
      line_items: [{ price: PLANS.premium.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
      metadata: { userId: user.id },
    });

    if (checkoutSession.url) {
      redirect(checkoutSession.url);
    }

    return { success: false, error: "Erro ao criar sessão de pagamento" };
  } catch (err) {
    // redirect() throws a special error in Next.js — rethrow it
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("[createCheckoutSession]", err);
    return {
      success: false,
      error: "Erro ao processar pagamento. Tente novamente.",
    };
  }
}

export async function createPortalSession(): Promise<StripeResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Faça login para continuar" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeId: true },
    });

    if (!user?.stripeId) {
      return { success: false, error: "Nenhuma assinatura encontrada" };
    }

    const { stripe } = await import("@/lib/stripe");

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    redirect(portalSession.url);
    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    return { success: false, error: "Erro ao acessar portal de pagamento" };
  }
}
