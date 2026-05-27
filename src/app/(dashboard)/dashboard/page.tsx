import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import type { ProfileScores } from "@/types";

export default async function DashboardPage() {
  const session = await auth();

  // Se auth não está configurado, mostra demo
  if (!process.env.GOOGLE_CLIENT_ID) {
    return (
      <DashboardClient userName="Desenvolvedor" userPlan="FREE" history={[]} />
    );
  }

  if (!session?.user?.id) redirect("/login");

  const [user, analyses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, plan: true },
    }),
    prisma.profileAnalysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        source: true,
        input: true,
        scores: true,
        createdAt: true,
      },
    }),
  ]);

  const history = analyses.map((a) => ({
    id: a.id,
    source: a.source,
    input: a.input,
    scores: a.scores as unknown as ProfileScores,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <DashboardClient
      userName={user?.name}
      userPlan={user?.plan ?? "FREE"}
      history={history}
    />
  );
}
