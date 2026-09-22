import { SERIF } from "../_lib/fonts";

interface StatBlockProps {
  value: string;
  label: string;
}

export function StatBlock({ value, label }: StatBlockProps) {
  return (
    <div className="text-center px-4">
      <p
        className={`text-4xl md:text-5xl text-[#1a2b4a] leading-none ${SERIF}`}
      >
        {value}
      </p>
      <p className="mt-3 text-[10px] md:text-xs uppercase tracking-[0.2em] text-[#6b6b6b]">
        {label}
      </p>
    </div>
  );
}