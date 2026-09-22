import { StatBlock } from "../_components/stat-block";

const STATS: { value: string; label: string }[] = [
  { value: "5000+", label: "Alumni Worldwide" },
  { value: "30+", label: "Years of Legacy" },
  { value: "100+", label: "Top Recruiters" },
  { value: "15+", label: "Countries" },
];

export function StatsBar() {
  return (
    <section className="bg-[#faf8f3] border-y border-[#e0dcd3]">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e0dcd3]">
        {STATS.map((stat) => (
          <StatBlock
            key={stat.label}
            value={stat.value}
            label={stat.label}
          />
        ))}
      </div>
    </section>
  );
}