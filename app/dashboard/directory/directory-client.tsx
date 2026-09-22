"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlumniCard } from "./alumni-card";
import type {
  AlumniDirectoryItem,
  Batch,
  College,
  Department,
} from "./directory-types";

export function DirectoryClient({
  currentUserId,
  colleges,
  departments,
  batches,
}: {
  currentUserId: string;
  colleges: College[];
  departments: Department[];
  batches: Batch[];
}) {
  const [items, setItems] = useState<AlumniDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mentorsOnly, setMentorsOnly] = useState(false);
  const [openToWorkOnly, setOpenToWorkOnly] = useState(false);

  /* ---------- Fetch ---------- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (collegeId) params.set("collegeId", collegeId);
      if (departmentId) params.set("departmentId", departmentId);
      if (batchId) params.set("batchId", batchId);
      if (verifiedOnly) params.set("verified", "true");
      if (mentorsOnly) params.set("mentors", "true");
      if (openToWorkOnly) params.set("openToWork", "true");

      const res = await fetch(
        `/api/alumni/directory?${params.toString()}`
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setItems(json.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load directory");
    } finally {
      setLoading(false);
    }
  }, [
    query,
    collegeId,
    departmentId,
    batchId,
    verifiedOnly,
    mentorsOnly,
    openToWorkOnly,
  ]);

  // Debounced fetch on filter change
  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  /* ---------- Connect ---------- */
  const handleConnect = async (a: AlumniDirectoryItem) => {
    setConnecting(a.id);
    try {
      const res = await fetch("/api/alumni/connection-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: a.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      // Optimistic update
      setItems((prev) =>
        prev.map((x) =>
          x.id === a.id
            ? {
                ...x,
                connectionStatus: "pending_sent",
                connectionId: json.data.id,
              }
            : x
        )
      );
      toast.success("Connection request sent");
    } catch (err: any) {
      toast.error(err.message || "Failed to connect");
    } finally {
      setConnecting(null);
    }
  };

  /* ---------- Message ---------- */
  const handleMessage = (a: AlumniDirectoryItem) => {
    // Redirect to messages page (future: pass conversation id)
    window.location.href = "/dashboard/messages";
  };

  /* ---------- Clear filters ---------- */
  const hasFilters =
    query ||
    collegeId ||
    departmentId ||
    batchId ||
    verifiedOnly ||
    mentorsOnly ||
    openToWorkOnly;

  const clearAll = () => {
    setQuery("");
    setCollegeId("");
    setDepartmentId("");
    setBatchId("");
    setVerifiedOnly(false);
    setMentorsOnly(false);
    setOpenToWorkOnly(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Alumni Directory</h1>
        <p className="text-sm text-muted-foreground">
          Discover and connect with alumni from your network.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-md border p-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, headline, job title or city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Select filters */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            value={collegeId || "all"}
            onValueChange={(v) => setCollegeId(v === "all" || v === null ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Colleges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colleges</SelectItem>
              {colleges.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={departmentId || "all"}
            onValueChange={(v) =>
              setDepartmentId(v === "all" || v === null ? "" : v)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={batchId || "all"}
            onValueChange={(v) => setBatchId(v === "all" || v === null ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Toggle filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="verified"
              checked={verifiedOnly}
              onCheckedChange={setVerifiedOnly}
            />
            <Label htmlFor="verified" className="cursor-pointer text-sm">
              Verified only
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="mentors"
              checked={mentorsOnly}
              onCheckedChange={setMentorsOnly}
            />
            <Label htmlFor="mentors" className="cursor-pointer text-sm">
              Mentors only
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="openToWork"
              checked={openToWorkOnly}
              onCheckedChange={setOpenToWorkOnly}
            />
            <Label htmlFor="openToWork" className="cursor-pointer text-sm">
              Open to work
            </Label>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-12 text-center">
          <Users className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No alumni found matching your filters.
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {items.length} alumni
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((a) => (
              <AlumniCard
                key={a.id}
                alumni={a}
                onConnect={handleConnect}
                onMessage={handleMessage}
                connecting={connecting === a.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}