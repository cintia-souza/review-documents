import type { UserPlan } from "@/types";

interface PlanBadgeProps {
  plan: UserPlan;
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  if (plan === "PREMIUM") {
    return (
      <span className="animate-glow inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 px-3 py-1 text-xs font-medium text-cyan-300">
        ✨ Premium
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400">
      Free
    </span>
  );
}
