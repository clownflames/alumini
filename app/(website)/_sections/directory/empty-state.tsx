import Link from "next/link";
import { FaUserGraduate } from "react-icons/fa";
import { SERIF } from "../../_lib/fonts";

export default function EmptyState() {
  return (
    <div className="py-24 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-[#f0ece2] border border-[#e0dcd3] flex items-center justify-center">
        <FaUserGraduate className="text-[#1a2b4a]/40" size={26} />
      </div>

      <h3 className={`mt-6 text-2xl text-[#1a2b4a] ${SERIF}`}>
        No alumni found
      </h3>

      <p className="mt-3 text-sm text-[#6b6b6b] max-w-md mx-auto">
        Try adjusting your filters or search terms. You can also clear all
        filters to see the full alumni list.
      </p>

      <div className="mt-8">
        <Link
          href="/directory"
          className="text-xs uppercase tracking-[0.15em] text-[#b8860b] hover:text-[#7a1e2e] underline underline-offset-4 transition-colors"
        >
          Clear all filters
        </Link>
      </div>
    </div>
  );
}