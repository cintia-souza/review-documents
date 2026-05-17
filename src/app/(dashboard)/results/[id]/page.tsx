import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ResultsView } from "@/components/results-view";
import type { ProfileScores, ProfileFeedback } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  // Only fetch analysis that belongs to the current user
  const analysis = await prisma.profileAnalysis.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!analysis) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <ResultsView
        result={{
          id: analysis.id,
          scores: analysis.scores as unknown as ProfileScores,
          feedback: analysis.feedback as unknown as ProfileFeedback,
          source: analysis.source as "linkedin_url" | "pdf_upload",
          createdAt: analysis.createdAt.toISOString(),
        }}
      />
    </main>
  );
}
