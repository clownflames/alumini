"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FaCheck, FaSearch } from "react-icons/fa";

interface FiltersProps {
  initialQ: string;
  initialDept: string;
  initialBatch: string;
  initialVerified: boolean;
  initialMentor: boolean;
  initialOpen: boolean;
  departments: string[];
  batches: number[];
}

export default function Filters({
  initialQ,
  initialDept,
  initialBatch,
  initialVerified,
  initialMentor,
  initialOpen,
  departments,
  batches,
}: FiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initialQ);
  const [dept, setDept] = useState(initialDept);
  const [batch, setBatch] = useState(initialBatch);
  const [verified, setVerified] = useState(initialVerified);
  const [mentor, setMentor] = useState(initialMentor);
  const [open, setOpen] = useState(initialOpen);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushUrl = (next: {
    q: string;
    dept: string;
    batch: string;
    verified: boolean;
    mentor: boolean;
    open: boolean;
  }) => {
    const params = new URLSearchParams();
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.dept !== "all") params.set("dept", next.dept);
    if (next.batch !== "all") params.set("batch", next.batch);
    if (next.verified) params.set("verified", "true");
    if (next.mentor) params.set("mentor", "true");
    if (next.open) params.set("open", "true");

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `?${query}` : "?", { scroll: false });
    });
  };

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (q !== initialQ) {
        pushUrl({ q, dept, batch, verified, mentor, open });
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const handleDept = (value: string) => {
    setDept(value);
    pushUrl({ q, dept: value, batch, verified, mentor, open });
  };

  const handleBatch = (value: string) => {
    setBatch(value);
    pushUrl({ q, dept, batch: value, verified, mentor, open });
  };

  const toggleVerified = () => {
    const next = !verified;
    setVerified(next);
    pushUrl({ q, dept, batch, verified: next, mentor, open });
  };

  const toggleMentor = () => {
    const next = !mentor;
    setMentor(next);
    pushUrl({ q, dept, batch, verified, mentor: next, open });
  };

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    pushUrl({ q, dept, batch, verified, mentor, open: next });
  };

  const handleClear = () => {
    setQ("");
    setDept("all");
    setBatch("all");
    setVerified(false);
    setMentor(false);
    setOpen(false);
    startTransition(() => {
      router.replace("?", { scroll: false });
    });
  };

  const hasActiveFilters =
    q.trim() !== "" ||
    dept !== "all" ||
    batch !== "all" ||
    verified ||
    mentor ||
    open;

  return (
    <section className="bg-[#faf8f3] border-b border-[#e0dcd3] sticky top-20 z-40">
      <div className="max-w-6xl mx-auto px-6 py-5">
        {/* Row 1 */}
        <div className="grid gap-3 md:grid-cols-[1fr_180px_160px_auto]">
          <div className="relative">
            <FaSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none"
              size={12}
            />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, company, or city..."
              className="w-full h-11 border border-[#e0dcd3] bg-white rounded-none pl-10 pr-4 text-sm focus:border-[#b8860b] focus:outline-none"
            />
          </div>

          <select
            value={dept}
            onChange={(e) => handleDept(e.target.value)}
            className="h-11 border border-[#e0dcd3] bg-white rounded-none px-4 text-sm text-[#1f1f1f] focus:border-[#b8860b] focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={batch}
            onChange={(e) => handleBatch(e.target.value)}
            className="h-11 border border-[#e0dcd3] bg-white rounded-none px-4 text-sm text-[#1f1f1f] focus:border-[#b8860b] focus:outline-none"
          >
            <option value="all">All Batches</option>
            {batches.map((b) => (
              <option key={b} value={String(b)}>
                {b}
              </option>
            ))}
          </select>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleClear}
              className="h-11 px-6 text-xs uppercase tracking-[0.15em] text-[#1a2b4a] border border-transparent hover:bg-[#f0ece2] transition-colors rounded-none"
            >
              Clear
            </button>
          ) : (
            <div aria-hidden className="hidden md:block h-11" />
          )}
        </div>

        {/* Row 2 — toggles */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          <label className="flex items-center cursor-pointer select-none">
            <span
              className={`w-4 h-4 border border-[#1a2b4a] rounded-none flex items-center justify-center ${
                verified ? "bg-[#1a2b4a] text-white" : "bg-transparent"
              }`}
            >
              {verified && <FaCheck size={10} />}
            </span>
            <input
              type="checkbox"
              checked={verified}
              onChange={toggleVerified}
              className="sr-only"
            />
            <span className="text-sm ml-2 text-[#1f1f1f]">Verified only</span>
          </label>

          <label className="flex items-center cursor-pointer select-none">
            <span
              className={`w-4 h-4 border border-[#1a2b4a] rounded-none flex items-center justify-center ${
                mentor ? "bg-[#1a2b4a] text-white" : "bg-transparent"
              }`}
            >
              {mentor && <FaCheck size={10} />}
            </span>
            <input
              type="checkbox"
              checked={mentor}
              onChange={toggleMentor}
              className="sr-only"
            />
            <span className="text-sm ml-2 text-[#1f1f1f]">Mentors only</span>
          </label>

          <label className="flex items-center cursor-pointer select-none">
            <span
              className={`w-4 h-4 border border-[#1a2b4a] rounded-none flex items-center justify-center ${
                open ? "bg-[#1a2b4a] text-white" : "bg-transparent"
              }`}
            >
              {open && <FaCheck size={10} />}
            </span>
            <input
              type="checkbox"
              checked={open}
              onChange={toggleOpen}
              className="sr-only"
            />
            <span className="text-sm ml-2 text-[#1f1f1f]">Open to work</span>
          </label>

          {isPending && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#6b6b6b] ml-auto">
              Searching...
            </span>
          )}
        </div>
      </div>
    </section>
  );
}