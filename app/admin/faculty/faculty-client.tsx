"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FacultyTable } from "./faculty-table";
import { FacultyViewDrawer } from "./faculty-view-drawer";
import {
  FacultyEditDrawer,
  type FacultyEditFormValues,
} from "./faculty-edit-drawer";
import {
  FacultyCreateDrawer,
  type FacultyCreateFormValues,
} from "./faculty-create-drawer";
import type { Faculty } from "./faculty-types";
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

export function FacultyClient({
  initialFaculty,
}: {
  initialFaculty: Faculty[];
}) {
  const [faculty, setFaculty] = useState(initialFaculty);
  const [query, setQuery] = useState("");

  const [viewTarget, setViewTarget] = useState<Faculty | null>(null);
  const [editTarget, setEditTarget] = useState<Faculty | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faculty | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const refetch = async () => {
    const res = await fetch("/api/admin/faculty");
    const json = await res.json();
    if (json.success) setFaculty(json.data);
  };

  /* ---------- CREATE ---------- */
  const handleCreateSubmit = async (values: FacultyCreateFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/faculty/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      await refetch();
      toast.success("Faculty account created");
      setCreateOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- EDIT ---------- */
  const handleEditSubmit = async (values: FacultyEditFormValues) => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/faculty/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      await refetch();
      toast.success("Faculty updated");
      setEditTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- DELETE ---------- */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/faculty/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setFaculty((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      toast.success("Faculty deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = query
    ? faculty.filter((f) => {
        const q = query.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q)
        );
      })
    : faculty;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Faculty</h1>
          <p className="text-sm text-muted-foreground">
            Manage faculty accounts and staff members.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Create Faculty
        </Button>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />

      <FacultyTable
        data={filtered}
        onView={(f) => setViewTarget(f)}
        onEdit={(f) => setEditTarget(f)}
        onDelete={(f) => setDeleteTarget(f)}
      />

      {/* Create */}
      <FacultyCreateDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        submitting={submitting}
        onSubmit={handleCreateSubmit}
      />

      {/* View */}
      <FacultyViewDrawer
        open={!!viewTarget}
        onOpenChange={(v) => !v && setViewTarget(null)}
        faculty={viewTarget}
      />

      {/* Edit */}
      <FacultyEditDrawer
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        faculty={editTarget}
        submitting={submitting}
        onSubmit={handleEditSubmit}
      />

      {/* Delete */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The faculty account will be
              permanently removed.
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