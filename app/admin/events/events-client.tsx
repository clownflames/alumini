"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventTable } from "./event-table";
import { EventDrawer, type EventFormValues } from "./event-drawer";
import { EventConfirmDialog } from "./event-dialog";
import type { College, Event } from "./event-types";
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

export function EventsClient({
  initialEvents,
  colleges,
}: {
  initialEvents: Event[];
  colleges: College[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [query, setQuery] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Event | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<EventFormValues | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const refetch = async () => {
    const res = await fetch("/api/admin/event");
    const json = await res.json();
    if (json.success) setEvents(json.data);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    setSubmitting(true);

    try {
      if (drawerMode === "create") {
        const res = await fetch("/api/admin/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Event created");
      } else if (editing) {
        const res = await fetch(`/api/admin/event/${editing.id}`, {
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

  const handleDelete = (e: Event) => setDeleteTarget(e);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/event/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success("Event deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = query
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          (e.location || "").toLowerCase().includes(query.toLowerCase())
      )
    : events;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage alumni events.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Create New
        </Button>
      </div>

      <Input
        placeholder="Search by title or location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      <EventTable
        data={filtered}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <EventDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        event={editing}
        colleges={colleges}
        submitting={submitting}
        onSubmit={handleDrawerSubmit}
      />

      <EventConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={submitting}
        mode={drawerMode}
        onConfirm={handleConfirm}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              event and all its registrations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}