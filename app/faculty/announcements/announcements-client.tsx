"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnnouncementTable } from "./announcement-table";
import { AnnouncementViewDrawer } from "./announcement-view-drawer";
import {
  AnnouncementDrawer,
  type AnnouncementFormValues,
} from "./announcement-drawer";
import { AnnouncementConfirmDialog } from "./announcement-dialog";
import type {
  Announcement,
  AnnouncementAudience,
  College,
} from "./announcement-types";

export function AnnouncementsClient({
  initialAnnouncements,
  colleges,
  currentUserId,
}: {
  initialAnnouncements: Announcement[];
  colleges: College[];
  currentUserId: string;
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [query, setQuery] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<
    "all" | AnnouncementAudience
  >("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | "mine">("all");

  const [viewTarget, setViewTarget] = useState<Announcement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<AnnouncementFormValues | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refetch = async () => {
    const res = await fetch("/api/faculty/announcement");
    const json = await res.json();
    if (json.success) setAnnouncements(json.data);
  };

  const openCreate = () => {
    setDrawerMode("create");
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setDrawerMode("edit");
    setEditing(a);
    setDrawerOpen(true);
  };

  const handleDrawerSubmit = (values: AnnouncementFormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    setSubmitting(true);

    try {
      if (drawerMode === "create") {
        const res = await fetch("/api/faculty/announcement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Announcement created");
      } else if (editing) {
        const res = await fetch(
          `/api/faculty/announcement/${editing.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pendingValues),
          }
        );
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Announcement updated");
      }

      setConfirmOpen(false);
      setDrawerOpen(false);
      setPendingValues(null);
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = announcements.filter((a) => {
    if (audienceFilter !== "all" && a.audience !== audienceFilter)
      return false;
    if (scopeFilter === "mine" && a.createdBy !== currentUserId) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Announcements</h1>
          <p className="text-sm text-muted-foreground">
            Broadcast updates to students, alumni and faculty.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Create Announcement
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by title or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />

        <Select
          value={scopeFilter}
          onValueChange={(v) => setScopeFilter(v as "all" | "mine")}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Announcements</SelectItem>
            <SelectItem value="mine">My Announcements</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={audienceFilter}
          onValueChange={(v) =>
            setAudienceFilter(v as "all" | AnnouncementAudience)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Audiences</SelectItem>
            <SelectItem value="alumni">Alumni</SelectItem>
            <SelectItem value="students">Students</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
          </SelectContent>
        </Select>

        {query || audienceFilter !== "all" || scopeFilter !== "all" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setAudienceFilter("all");
              setScopeFilter("all");
            }}
          >
            Clear
          </Button>
        ) : null}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {announcements.length}
        </span>
      </div>

      {/* Table */}
      <AnnouncementTable
        data={filtered}
        currentUserId={currentUserId}
        onView={(a) => setViewTarget(a)}
        onEdit={openEdit}
      />

      {/* View drawer */}
      <AnnouncementViewDrawer
        open={!!viewTarget}
        onOpenChange={(v) => !v && setViewTarget(null)}
        announcement={viewTarget}
      />

      {/* Create / edit drawer */}
      <AnnouncementDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        announcement={editing}
        colleges={colleges}
        submitting={submitting}
        onSubmit={handleDrawerSubmit}
      />

      {/* Confirm dialog */}
      <AnnouncementConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={submitting}
        mode={drawerMode}
        onConfirm={handleConfirm}
      />
    </div>
  );
}