"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobCard } from "./job-card";
import { JobViewDrawer } from "./job-view-drawer";
import { ApplyDialog, type ApplyFormValues } from "./apply-dialog";
import type { Job, JobExperience, JobType } from "./job-types";

type Tab = "all" | "applied";

export function JobsClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [jobType, setJobType] = useState<"all" | JobType>("all");
  const [experience, setExperience] = useState<"all" | JobExperience>("all");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const [viewTarget, setViewTarget] = useState<Job | null>(null);
  const [applyTarget, setApplyTarget] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);

  /* ---------- Fetch ---------- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (jobType !== "all") params.set("jobType", jobType);
      if (experience !== "all") params.set("experience", experience);
      if (remoteOnly) params.set("remote", "true");
      if (tab === "applied") params.set("applied", "true");

      const res = await fetch(`/api/alumni/jobs?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setJobs(json.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [query, jobType, experience, remoteOnly, tab]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  /* ---------- Open apply ---------- */
  const openApply = (job: Job) => {
    setApplyTarget(job);
  };

  /* ---------- Submit application ---------- */
  const handleApply = async (values: ApplyFormValues) => {
    if (!applyTarget) return;
    setApplying(true);
    setBusyId(applyTarget.id);

    try {
      const res = await fetch(
        `/api/alumni/jobs/${applyTarget.id}/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      // Update local state
      setJobs((prev) =>
        prev.map((j) =>
          j.id === applyTarget.id
            ? {
                ...j,
                hasApplied: true,
                applicationStatus: "applied",
              }
            : j
        )
      );

      // Update drawer if open
      if (viewTarget?.id === applyTarget.id) {
        setViewTarget((prev) =>
          prev
            ? {
                ...prev,
                hasApplied: true,
                applicationStatus: "applied",
              }
            : prev
        );
      }

      toast.success("Application submitted");
      setApplyTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to apply");
    } finally {
      setApplying(false);
      setBusyId(null);
    }
  };

  const hasFilters =
    query || jobType !== "all" || experience !== "all" || remoteOnly;

  const clearFilters = () => {
    setQuery("");
    setJobType("all");
    setExperience("all");
    setRemoteOnly(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <p className="text-sm text-muted-foreground">
          Discover jobs and internships from your alumni network.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="applied">My Applications</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="space-y-3 rounded-md border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, company or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            value={jobType}
            onValueChange={(v) => setJobType(v as "all" | JobType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Job Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Types</SelectItem>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={experience}
            onValueChange={(v) =>
              setExperience(v as "all" | JobExperience)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior Level</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 rounded-md border px-3">
            <Switch
              id="remote"
              checked={remoteOnly}
              onCheckedChange={setRemoteOnly}
            />
            <Label htmlFor="remote" className="cursor-pointer text-sm">
              Remote only
            </Label>
          </div>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-12 text-center">
          <Briefcase className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {tab === "applied"
              ? "You haven't applied to any jobs yet."
              : "No jobs found matching your filters."}
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {jobs.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                onView={setViewTarget}
                onApply={openApply}
                busy={busyId === j.id}
              />
            ))}
          </div>
        </>
      )}

      {/* View drawer */}
      <JobViewDrawer
        open={!!viewTarget}
        onOpenChange={(v) => !v && setViewTarget(null)}
        job={viewTarget}
        onApply={(j) => {
          setViewTarget(null);
          openApply(j);
        }}
        busy={busyId === viewTarget?.id}
      />

      {/* Apply dialog */}
      <ApplyDialog
        open={!!applyTarget}
        onOpenChange={(v) => !v && setApplyTarget(null)}
        jobTitle={applyTarget?.title || ""}
        submitting={applying}
        onSubmit={handleApply}
      />
    </div>
  );
}