import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseQuery: string;
}

function buildHref(baseQuery: string, page: number): string {
  const params = new URLSearchParams(baseQuery);
  params.set("page", String(page));
  return `?${params.toString()}`;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseQuery,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  const prevHref = isFirst
    ? "#"
    : buildHref(baseQuery, currentPage - 1);
  const nextHref = isLast
    ? "#"
    : buildHref(baseQuery, currentPage + 1);

  return (
    <div className="flex items-center justify-center gap-6 py-16">
      {isFirst ? (
        <span className="text-xs uppercase tracking-[0.15em] text-[#b8b2a7] cursor-not-allowed">
          &larr; Previous
        </span>
      ) : (
        <Link
          href={prevHref}
          className="text-xs uppercase tracking-[0.15em] text-[#b8860b] hover:text-[#7a1e2e] transition-colors"
        >
          &larr; Previous
        </Link>
      )}

      <span className="text-xs uppercase tracking-[0.2em] text-[#6b6b6b]">
        Page {currentPage} of {totalPages}
      </span>

      {isLast ? (
        <span className="text-xs uppercase tracking-[0.15em] text-[#b8b2a7] cursor-not-allowed">
          Next &rarr;
        </span>
      ) : (
        <Link
          href={nextHref}
          className="text-xs uppercase tracking-[0.15em] text-[#b8860b] hover:text-[#7a1e2e] transition-colors"
        >
          Next &rarr;
        </Link>
      )}
    </div>
  );
}