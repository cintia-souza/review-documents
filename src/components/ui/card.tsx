interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = "", glow = false }: CardProps) {
  return (
    <div
      className={`relative rounded-2xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-sm transition-all ${
        glow ? "hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
