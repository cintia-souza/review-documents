"use client";

import { useState, useTransition } from "react";
import { createCheckoutSession } from "@/actions/stripe";

export function CheckoutButton() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setError("");
    startTransition(async () => {
      const result = await createCheckoutSession();
      if (!result.success && result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-busy={isPending}
        className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Processando...
          </span>
        ) : (
          "Assinar Premium — R$29/mês"
        )}
      </button>
      {error && (
        <p role="alert" className="mt-2 rounded-lg bg-rose-500/10 px-4 py-2 text-sm text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
