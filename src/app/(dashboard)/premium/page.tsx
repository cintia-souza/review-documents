import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PremiumTools } from "@/components/premium-tools";
import { CheckoutButton } from "@/components/checkout-button";
import Link from "next/link";

export default async function PremiumPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, name: true },
  });

  if (user?.plan !== "PREMIUM") {
    return <PremiumSalesPage />;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Ferramentas Premium</h1>
            <p className="text-sm text-zinc-400">Recursos exclusivos para impulsionar seu perfil</p>
          </div>
        </div>
      </header>
      <PremiumTools userName={user.name} />
    </main>
  );
}

function PremiumSalesPage() {
  const features = [
    { icon: "✍️", title: "Reescrita do Sobre", desc: "IA reescreve seu resumo com tom profissional e impactante" },
    { icon: "📅", title: "Calendário Editorial", desc: "30 dias de ideias de posts personalizadas ao seu perfil" },
    { icon: "📸", title: "Análise de Foto", desc: "Recomendações para foto de perfil que converte" },
    { icon: "🎯", title: "Tom de Voz", desc: "Diretrizes de comunicação alinhadas ao seu setor" },
    { icon: "#️⃣", title: "Hashtags Estratégicas", desc: "Hashtags otimizadas para alcance no seu nicho" },
    { icon: "📊", title: "Análise Completa", desc: "Scores detalhados com plano de ação personalizado" },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <span className="inline-block rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 px-4 py-1.5 text-xs font-medium text-cyan-400">
          PREMIUM
        </span>
        <h1 className="mt-4 text-4xl font-bold text-white">
          Desbloqueie todo o potencial
        </h1>
        <p className="mt-2 text-zinc-400">
          Ferramentas avançadas de IA para transformar seu perfil profissional
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} glow>
            <span className="text-2xl">{f.icon}</span>
            <h3 className="mt-3 font-semibold text-white">{f.title}</h3>
            <p className="mt-1 text-sm text-zinc-400">{f.desc}</p>
          </Card>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-3">
        <CheckoutButton />
        <p className="text-xs text-zinc-500">
          Cancele quando quiser. Sem compromisso.
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-600">
          <Link href="/termos" className="hover:text-zinc-400 underline underline-offset-2">
            Termos de Uso
          </Link>
          <span>•</span>
          <Link href="/privacidade" className="hover:text-zinc-400 underline underline-offset-2">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </main>
  );
}
