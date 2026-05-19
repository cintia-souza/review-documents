"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";
import Link from "next/link";

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
    const name = formData.get("name") as string | null;

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
          <Link href="/" aria-label="Voltar para a página inicial">
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
          </Link>
          <h1 className="mt-4 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-2xl font-bold text-transparent">
            ProfileAI
          </h1>
          <p className="mt-1 text-sm text-zinc-400" id="form-description">
            {mode === "login" ? "Entre na sua conta para continuar" : "Crie sua conta gratuita"}
          </p>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Tipo de acesso" className="flex gap-1 rounded-xl bg-zinc-800 p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
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
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-describedby="form-description"
          noValidate
        >
          {mode === "register" && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-zinc-400">
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Seu nome"
                defaultValue=""
                className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="seu@email.com"
              defaultValue=""
              aria-invalid={error ? "true" : undefined}
              className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 aria-[invalid=true]:border-rose-500/50"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Mínimo 6 caracteres"
              defaultValue=""
              aria-describedby="password-hint"
              className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30"
            />
            {mode === "register" && (
              <p id="password-hint" className="mt-1 text-xs text-zinc-600">
                Use pelo menos 6 caracteres
              </p>
            )}
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="rounded-lg bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                {mode === "login" ? "Entrando..." : "Criando conta..."}
              </span>
            ) : (
              mode === "login" ? "Entrar" : "Criar conta"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600">
          Ao continuar, você concorda com nossos{" "}
          <Link href="/termos" className="text-zinc-400 underline underline-offset-2 hover:text-white">Termos de Uso</Link>
          {" "}e{" "}
          <Link href="/privacidade" className="text-zinc-400 underline underline-offset-2 hover:text-white">Política de Privacidade</Link>.
        </p>
      </div>
    </main>
  );
}
