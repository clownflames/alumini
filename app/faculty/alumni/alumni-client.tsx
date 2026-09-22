"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlumniTable } from "./alumni-table";
import { AlumniViewDrawer } from "./alumni-view-drawer";
import type { Alumni } from "./alumni-types";

export function AlumniClient({
  initialAlumni,
}: {
  initialAlumni: Alumni[];
}) {
  const [alumni] = useState(initialAlumni);
  const [query, setQuery] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<
    "all" | "verified" | "unverified" | "mentors" | "open_to_work"
  >("all");

  const [viewTarget, setViewTarget] = useState<Alumni | null>(null);

  const filtered = alumni.filter((a) => {
    if (verifiedFilter === "verified" && !a.isVerified) return false;
    if (verifiedFilter === "unverified" && a.isVerified) return false;
    if (verifiedFilter === "mentors" && !a.isMentor) return false;
    if (verifiedFilter === "open_to_work" && !a.isOpenToWork) return false;

    if (query) {
      const q = query.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.headline || "").toLowerCase().includes(q) ||
        (a.currentJobTitle || "").toLowerCase().includes(q) ||
        (a.collegeName || "").toLowerCase().includes(q) ||
        (a.departmentName || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Alumni</h1>
          <p className="text-sm text-muted-foreground">
            View and search alumni in your college.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name, email, headline, company..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />

        <Select
          value={verifiedFilter}
          onValueChange={(v) => setVerifiedFilter(v as any)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Alumni</SelectItem>
            <SelectItem value="verified">Verified Only</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
            <SelectItem value="mentors">Mentors</SelectItem>
            <SelectItem value="open_to_work">Open to Work</SelectItem>
          </SelectContent>
        </Select>

        {query || verifiedFilter !== "all" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setVerifiedFilter("all");
            }}
          >
            Clear
          </Button>
        ) : null}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {alumni.length}
        </span>
      </div>

      {/* Table */}
      <AlumniTable data={filtered} onView={(a) => setViewTarget(a)} />

      {/* View drawer */}
      <AlumniViewDrawer
        open={!!viewTarget}
        onOpenChange={(v) => !v && setViewTarget(null)}
        alumni={viewTarget}
      />
    </div>
  );
}