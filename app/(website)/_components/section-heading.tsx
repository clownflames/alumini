import { SERIF } from "../_lib/fonts";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
  description?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  align = "left",
  description,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div className={isCenter ? "text-center" : ""}>
      <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-[#b8860b] font-medium">
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-3xl md:text-4xl text-[#1a2b4a] leading-tight ${SERIF}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-[#6b6b6b] max-w-2xl ${
            isCenter ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
      <div
        className={`mt-6 w-12 h-px bg-[#b8860b] ${
          isCenter ? "mx-auto" : ""
        }`}
      />
    </div>
  );
}