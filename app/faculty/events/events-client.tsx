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
import { EventTable } from "./event-table";
import { EventViewDrawer } from "./event-view-drawer";
import { EventDrawer, type EventFormValues } from "./event-drawer";
import { EventConfirmDialog } from "./event-dialog";
import type { College, Event, EventStatus } from "./event-types";

export function EventsClient({
  initialEvents,
  colleges,
  currentUserId,
}: {
  initialEvents: Event[];
  colleges: College[];
  currentUserId: string;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EventStatus>("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | "mine">("all");

  const [viewTarget, setViewTarget] = useState<Event | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Event | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<EventFormValues | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  const refetch = async () => {
    const res = await fetch("/api/faculty/event");
    const json = await res.json();
    if (json.success) setEvents(json.data);
  };

  const openCreate = () => {
    setDrawerMode("create");
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (e: Event) => {
    setDrawerMode("edit");
    setEditing(e);
    setDrawerOpen(true);
  };

  const handleDrawerSubmit = (values: EventFormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    setSubmitting(true);

    try {
      if (drawerMode === "create") {
        const res = await fetch("/api/faculty/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Event created");
      } else if (editing) {
        const res = await fetch(`/api/faculty/event/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Event updated");
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

  const filtered = events.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (scopeFilter === "mine" && e.createdBy !== currentUserId) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        (e.location || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage college events.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by title or location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />

        <Select
          value={scopeFilter}
          onValueChange={(v) => setScopeFilter(v as "all" | "mine")}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="mine">My Events</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as "all" | EventStatus)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {query || statusFilter !== "all" || scopeFilter !== "all" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
              setScopeFilter("all");
            }}
          >
            Clear
          </Button>
        ) : null}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {events.length}
        </span>
      </div>

      {/* Table */}
      <EventTable
        data={filtered}
        currentUserId={currentUserId}
        onView={(e) => setViewTarget(e)}
        onEdit={openEdit}
      />

      {/* View drawer */}
      <EventViewDrawer
        open={!!viewTarget}
        onOpenChange={(v) => !v && setViewTarget(null)}
        event={viewTarget}
      />

      {/* Create / edit drawer */}
      <EventDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        event={editing}
        colleges={colleges}
        submitting={submitting}
        onSubmit={handleDrawerSubmit}
      />

      {/* Confirm dialog */}
      <EventConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={submitting}
        mode={drawerMode}
        onConfirm={handleConfirm}
      />
    </div>
  );
}