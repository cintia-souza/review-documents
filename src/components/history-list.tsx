import Link from "next/link";
import type { ProfileScores } from "@/types";

interface HistoryItem {
  id: string;
  source: string;
  input: string;
  scores: ProfileScores;
  createdAt: string;
}

interface HistoryListProps {
  items: HistoryItem[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return "from-emerald-400 to-cyan-400";
  if (score >= 60) return "from-cyan-400 to-violet-400";
  return "from-rose-400 to-orange-400";
}

export function HistoryList({ items }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800">
          <svg
            className="h-6 w-6 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          Nenhuma análise ainda. Faça sua primeira acima!
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Histórico de análises" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Análises Recentes
        </h2>
        <span className="text-xs text-zinc-600">{items.length} análise(s)</span>
      </div>

      <div className="space-y-2" role="list">
        {items.map((item) => {
          const gradient = getScoreColor(item.scores.overall);
          return (
            <Link
              key={item.id}
              href={`/results/${item.id}`}
              role="listitem"
              aria-label={`Análise de ${item.input} — Score ${item.scores.overall}`}
              className="group flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/50 px-5 py-4 transition-all hover:border-white/10 hover:bg-zinc-900/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 transition-colors group-hover:bg-zinc-700">
                  <span className="text-lg" aria-hidden="true">
                    {item.source === "linkedin_url" ? "🔗" : "📄"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-cyan-50">
                    {item.input}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`bg-gradient-to-r ${gradient} bg-clip-text text-xl font-bold tabular-nums text-transparent`}
                >
                  {item.scores.overall}
                </span>
                <svg
                  className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
