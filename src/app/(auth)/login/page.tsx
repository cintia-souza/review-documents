"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (mode === "register") {
      const result = await registerUser(formData);
      if (!result.success) {
        setError(result.error ?? "Erro ao criar conta");
        setLoading(false);
        return;
      }
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(mode === "login" ? "Email ou senha incorretos" : "Erro ao entrar. Tente novamente.");
    } else {
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur-sm">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="mt-4 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-2xl font-bold text-transparent">
            ProfileAI
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {mode === "login" ? "Entre na sua conta" : "Crie sua conta gratuita"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-zinc-800 p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === m
                  ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {m === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label htmlFor="name" className="mb-1 block text-xs font-medium text-zinc-400">
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Seu nome"
                className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-zinc-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="seu@email.com"
              className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-zinc-400">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••"
              className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>

          {error && (
            <p role="alert" className="text-center text-sm text-rose-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {mode === "login" ? "Entrando..." : "Criando conta..."}
              </span>
            ) : (
              mode === "login" ? "Entrar" : "Criar conta"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
