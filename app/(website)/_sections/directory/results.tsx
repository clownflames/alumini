import type { DirectoryAlumni } from "../../_data/alumni";
import AlumniCard from "./alumni-card";
import EmptyState from "./empty-state";

interface ResultsProps {
  alumni: DirectoryAlumni[];
  total: number;
}

export default function Results({ alumni, total }: ResultsProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between py-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b]">
          {total} {total === 1 ? "Alumnus" : "Alumni"} Found
        </p>
      </div>

      {alumni.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {alumni.map((a) => (
            <AlumniCard key={a.id} alumni={a} />
          ))}
        </div>
      )}
    </div>
  );
}