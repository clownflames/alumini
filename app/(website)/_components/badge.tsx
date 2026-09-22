import type { ReactNode } from "react";

type BadgeVariant = "gold" | "navy" | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  gold: "bg-[#b8860b] text-white",
  navy: "bg-[#1a2b4a] text-white",
  outline: "border border-[#1a2b4a] text-[#1a2b4a] bg-transparent",
};

export function Badge({
  variant = "gold",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] font-medium rounded-none ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}