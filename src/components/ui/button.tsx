import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const variants = {
  primary:
    "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40",
  secondary:
    "border border-white/10 text-zinc-300 hover:border-white/20 hover:text-white",
  ghost: "text-zinc-400 hover:text-white",
} as const;

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl px-6 py-3 text-sm font-medium transition-all disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
