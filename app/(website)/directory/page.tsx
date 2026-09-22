import type { Metadata } from "next";
import { alumniDirectory } from "../_data/alumni";
import DirectoryHero from "../_sections/directory/hero";
import Filters from "../_sections/directory/filters";
import Results from "../_sections/directory/results";
import Pagination from "../_sections/directory/pagination";

export const metadata: Metadata = {
  title: "Alumni Directory | CIITM Alumni",
  description:
    "Browse the CIITM alumni directory. Filter by department, batch, and career. Connect with fellow Compucomites.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    dept?: string;
    batch?: string;
    verified?: string;
    mentor?: string;
    open?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 12;

export default async function DirectoryPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const q = (sp.q ?? "").trim().toLowerCase();
  const dept = sp.dept ?? "all";
  const batch = sp.batch ?? "all";
  const verified = sp.verified === "true";
  const mentor = sp.mentor === "true";
  const open = sp.open === "true";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const filtered = alumniDirectory.filter((a) => {
    if (q) {
      const haystack = [
        a.name,
        a.company,
        a.role,
        a.city,
        a.headline,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (dept !== "all" && a.department !== dept) return false;
    if (batch !== "all" && String(a.batch) !== batch) return false;
    if (verified && !a.isVerified) return false;
    if (mentor && !a.isMentor) return false;
    if (open && !a.isOpenToWork) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const departments = Array.from(
    new Set(alumniDirectory.map((a) => a.department))
  ).sort();

  const batches = Array.from(
    new Set(alumniDirectory.map((a) => a.batch))
  ).sort((a, b) => b - a);

  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (dept !== "all") params.set("dept", dept);
  if (batch !== "all") params.set("batch", batch);
  if (verified) params.set("verified", "true");
  if (mentor) params.set("mentor", "true");
  if (open) params.set("open", "true");
  const baseQuery = params.toString();

  return (
    <>
      <DirectoryHero />

      <Filters
        initialQ={sp.q ?? ""}
        initialDept={dept}
        initialBatch={batch}
        initialVerified={verified}
        initialMentor={mentor}
        initialOpen={open}
        departments={departments}
        batches={batches}
      />

      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <Results alumni={pageSlice} total={filtered.length} />
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            baseQuery={baseQuery}
          />
        </div>
      </section>
    </>
  );
}