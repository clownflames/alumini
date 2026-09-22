import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "outlineLight"
  | "ghost";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-none font-medium uppercase tracking-[0.15em] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

const sizes: Record<ButtonSize, string> = {
  sm: "text-[10px] px-4 h-9",
  md: "text-xs px-6 h-11",
  lg: "text-sm px-8 h-12",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#b8860b] text-white border border-[#b8860b] hover:bg-[#a07508] hover:border-[#a07508]",
  secondary:
    "bg-[#1a2b4a] text-white border border-[#1a2b4a] hover:bg-[#152238]",
  outline:
    "bg-transparent text-[#1a2b4a] border border-[#1a2b4a] hover:bg-[#1a2b4a] hover:text-white",
  outlineLight:
    "bg-transparent text-white border border-white/70 hover:bg-white hover:text-[#1a2b4a]",
  ghost:
    "bg-transparent text-[#1a2b4a] border border-transparent hover:bg-[#f0ece2]",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  className = "",
  children,
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}