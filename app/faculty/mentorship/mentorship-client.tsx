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
import { MentorshipTable } from "./mentorship-table";
import { MentorshipViewDrawer } from "./mentorship-view-drawer";
import type { Mentorship, MentorshipStatus } from "./mentorship-types";

export function MentorshipClient({
  initialMentorships,
}: {
  initialMentorships: Mentorship[];
}) {
  const [mentorships] = useState(initialMentorships);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MentorshipStatus>(
    "all"
  );

  const [viewTarget, setViewTarget] = useState<Mentorship | null>(null);

  const filtered = mentorships.filter((m) => {
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        (m.mentorName || "").toLowerCase().includes(q) ||
        (m.menteeName || "").toLowerCase().includes(q) ||
        (m.mentorEmail || "").toLowerCase().includes(q) ||
        (m.menteeEmail || "").toLowerCase().includes(q) ||
        (m.goal || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* ---------- Summary counts ---------- */
  const totalCount = mentorships.length;
  const activeCount = mentorships.filter((m) => m.status === "active").length;
  const pendingCount = mentorships.filter(
    (m) => m.status === "pending"
  ).length;
  const completedCount = mentorships.filter(
    (m) => m.status === "completed"
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Mentorship</h1>
        <p className="text-sm text-muted-foreground">
          Track mentor-mentee relationships across the platform.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total" value={totalCount} />
        <SummaryCard label="Active" value={activeCount} highlight />
        <SummaryCard label="Pending" value={pendingCount} />
        <SummaryCard label="Completed" value={completedCount} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name, email or goal..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />

        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as "all" | MentorshipStatus)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {query || statusFilter !== "all" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
            }}
          >
            Clear
          </Button>
        ) : null}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {mentorships.length}
        </span>
      </div>

      {/* Table */}
      <MentorshipTable
        data={filtered}
        onView={(m) => setViewTarget(m)}
      />

      {/* View drawer */}
      <MentorshipViewDrawer
        open={!!viewTarget}
        onOpenChange={(v) => !v && setViewTarget(null)}
        mentorship={viewTarget}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-md border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          highlight && value > 0
            ? "mt-1 text-2xl font-semibold text-primary"
            : "mt-1 text-2xl font-semibold"
        }
      >
        {value}
      </p>
    </div>
  );
}