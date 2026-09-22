import { SectionHeading } from "../../_components/section-heading";
import { StatBlock } from "../../_components/stat-block";

const STATS: { value: string; label: string }[] = [
  { value: "30+", label: "Years of Excellence" },
  { value: "5+", label: "Programs Offered" },
  { value: "100+", label: "Top Recruiters" },
  { value: "5000+", label: "Alumni Worldwide" },
];

export default function AtAGlance() {
  return (
    <section className="bg-[#faf8f3] py-20">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          align="center"
          eyebrow="At a Glance"
          title="CIITM in Numbers"
        />

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e0dcd3] border-y border-[#e0dcd3] py-10">
          {STATS.map((stat) => (
            <StatBlock
              key={stat.label}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>

        <p className="mt-12 text-center text-[10px] uppercase tracking-[0.25em] text-[#6b6b6b]">
          AICTE Approved
          <span className="mx-3 text-[#b8860b]">&middot;</span>
          RTU Kota Affiliated
          <span className="mx-3 text-[#b8860b]">&middot;</span>
          NAAC Accredited
        </p>
      </div>
    </section>
  );
}