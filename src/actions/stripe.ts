"use server";

import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function createCheckoutSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autenticado");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("Usuário não encontrado");

  if (user.plan === "PREMIUM") {
    redirect("/dashboard");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: user.email,
    mode: "subscription",
    line_items: [{ price: PLANS.premium.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
    metadata: { userId: user.id },
  });

  redirect(checkoutSession.url!);
}

export async function createPortalSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autenticado");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeId: true },
  });

  if (!user?.stripeId) {
    throw new Error("Nenhuma assinatura encontrada");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  redirect(portalSession.url);
}
