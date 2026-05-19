import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export async function Navbar() {
  const session = await auth();

  let plan: "FREE" | "PREMIUM" = "FREE";
  let userName = "";
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, name: true },
    });
    plan = user?.plan ?? "FREE";
    userName = user?.name ?? "";
  }

  const isPremium = plan === "PREMIUM";

  return (
    <nav aria-label="Navegação principal" className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500" aria-hidden="true">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-lg font-bold text-transparent">
            ProfileAI
          </span>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden items-center gap-1 sm:flex">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            Dashboard
          </Link>
          {isPremium && (
            <Link
              href="/premium"
              className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              Ferramentas IA
            </Link>
          )}
        </div>

        {/* User area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isPremium ? (
            <span className="animate-glow hidden items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 px-3 py-1.5 text-xs font-medium text-cyan-300 sm:inline-flex">
              ✨ Premium
            </span>
          ) : (
            <Link
              href="/premium"
              className="hidden rounded-full bg-gradient-to-r from-cyan-500/10 to-violet-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 transition-all hover:from-cyan-500/20 hover:to-violet-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 sm:inline-flex"
            >
              ✨ Upgrade
            </Link>
          )}

          {session?.user && (
            <div className="flex items-center gap-2">
              {/* Avatar + Name */}
              <div className="flex items-center gap-2">
                <div className="relative" aria-hidden="true">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-xs font-bold text-white">
                    {userName.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-400" />
                </div>
                <span className="hidden text-sm text-zinc-300 sm:inline">
                  {userName.split(" ")[0]}
                </span>
              </div>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  aria-label="Sair da conta"
                  className="rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  Sair
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {session?.user && (
        <div className="flex items-center gap-1 border-t border-white/5 px-4 py-2 sm:hidden">
          <Link
            href="/dashboard"
            className="flex-1 rounded-lg px-3 py-2 text-center text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/premium"
            className="flex-1 rounded-lg px-3 py-2 text-center text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            {isPremium ? "Ferramentas IA" : "Premium"}
          </Link>
        </div>
      )}
    </nav>
  );
}
