"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Briefcase, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApplicationCard } from "./application-card";
import { ApplicationViewDrawer } from "./application-view-drawer";
import type { Application, ApplicationStatus } from "./application-types";

type Tab = "all" | ApplicationStatus;

export function ApplicationsClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [viewTarget, setViewTarget] = useState<Application | null>(null);
  const [withdrawTarget, setWithdrawTarget] =
    useState<Application | null>(null);

  /* ---------- Fetch ---------- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alumni/applications");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setApplications(json.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------- Counts ---------- */
  const counts = {
    all: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    reviewing: applications.filter((a) => a.status === "reviewing").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted")
      .length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
  };

  /* ---------- Filter ---------- */
  const filtered = applications.filter((a) => {
    if (tab !== "all" && a.status !== tab) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        a.jobTitle.toLowerCase().includes(q) ||
        (a.companyName || "").toLowerCase().includes(q) ||
        (a.jobLocation || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* ---------- Withdraw ---------- */
  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    setBusyId(withdrawTarget.id);
    try {
      const res = await fetch(
        `/api/alumni/applications/${withdrawTarget.id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setApplications((prev) =>
        prev.filter((a) => a.id !== withdrawTarget.id)
      );
      toast.success("Application withdrawn");
      setWithdrawTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to withdraw");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">My Applications</h1>
        <p className="text-sm text-muted-foreground">
          Track the status of your job applications.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="all">
            All
            {counts.all > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {counts.all}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="applied">
            Applied
            {counts.applied > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {counts.applied}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewing">
            Reviewing
            {counts.reviewing > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {counts.reviewing}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="shortlisted">
            Shortlisted
            {counts.shortlisted > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {counts.shortlisted}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted
            {counts.accepted > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {counts.accepted}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <Input
        placeholder="Search by job title, company or location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />

      {/* Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-12 text-center">
          <ClipboardList className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {applications.length === 0
              ? "You haven't applied to any jobs yet."
              : tab === "all"
                ? "No applications match your search."
                : `No applications with status "${tab}".`}
          </p>
          {applications.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              render={<a href="/dashboard/jobs" />}
            >
              <Briefcase className="mr-2 size-4" />
              Browse Jobs
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {filtered.length}{" "}
            {filtered.length === 1 ? "application" : "applications"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <ApplicationCard
                key={a.id}
                application={a}
                onView={setViewTarget}
                onWithdraw={setWithdrawTarget}
                busy={busyId === a.id}
              />
            ))}
          </div>
        </>
      )}

      {/* View drawer */}
      <ApplicationViewDrawer
        open={!!viewTarget}
        onOpenChange={(v) => !v && setViewTarget(null)}
        application={viewTarget}
      />

      {/* Withdraw confirm */}
      <AlertDialog
        open={!!withdrawTarget}
        onOpenChange={(v) => !v && setWithdrawTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw this application?</AlertDialogTitle>
            <AlertDialogDescription>
              Your application for{" "}
              <strong>{withdrawTarget?.jobTitle}</strong> at{" "}
              <strong>{withdrawTarget?.companyName || "the company"}</strong>{" "}
              will be removed. You can apply again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId === withdrawTarget?.id}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleWithdraw();
              }}
              disabled={busyId === withdrawTarget?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busyId === withdrawTarget?.id && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}