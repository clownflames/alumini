type DividerVariant = "gold" | "subtle";

interface DividerProps {
  variant?: DividerVariant;
  className?: string;
}

export function Divider({ variant = "gold", className = "" }: DividerProps) {
  const color = variant === "gold" ? "bg-[#b8860b]" : "bg-[#e0dcd3]";
  return <hr className={`border-0 h-px ${color} ${className}`} />;
}