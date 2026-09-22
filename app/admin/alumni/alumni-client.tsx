"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlumniTable } from "./alumni-table";
import { AlumniViewDrawer } from "./alumni-view-drawer";
import {
  AlumniEditDrawer,
  type AlumniFormValues,
} from "./alumni-edit-drawer";
import {
  AlumniCreateDrawer,
  type AlumniCreateFormValues,
} from "./alumni-create-drawer";
import type {
  Alumni,
  Batch,
  College,
  Department,
} from "./alumni-types";
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

export function AlumniClient({
  initialAlumni,
  colleges,
  departments,
  batches,
}: {
  initialAlumni: Alumni[];
  colleges: College[];
  departments: Department[];
  batches: Batch[];
}) {
  const [alumni, setAlumni] = useState(initialAlumni);
  const [query, setQuery] = useState("");

  const [viewTarget, setViewTarget] = useState<Alumni | null>(null);
  const [editTarget, setEditTarget] = useState<Alumni | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Alumni | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const refetch = async () => {
    const res = await fetch("/api/admin/alumni");
    const json = await res.json();
    if (json.success) setAlumni(json.data);
  };

  /* ---------- CREATE ---------- */
  const handleCreateSubmit = async (values: AlumniCreateFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/alumni/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      await refetch();
      toast.success("Alumni account created");
      setCreateOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- EDIT ---------- */
  const handleEditSubmit = async (values: AlumniFormValues) => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/alumni/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      await refetch();
      toast.success("Alumni updated");
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
      const res = await fetch(`/api/admin/alumni/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setAlumni((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success("Alumni deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = query
    ? alumni.filter((a) => {
        const q = query.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.headline || "").toLowerCase().includes(q) ||
          (a.currentJobTitle || "").toLowerCase().includes(q) ||
          (a.collegeName || "").toLowerCase().includes(q)
        );
      })
    : alumni;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Alumni</h1>
          <p className="text-sm text-muted-foreground">
            Manage alumni members of your college(s).
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Create Alumni
        </Button>
      </div>

      <Input
        placeholder="Search by name, email, headline, company or college..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />

      <AlumniTable
        data={filtered}
        onView={(a) => setViewTarget(a)}
        onEdit={(a) => setEditTarget(a)}
        onDelete={(a) => setDeleteTarget(a)}
      />

      {/* Create */}
      <AlumniCreateDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        colleges={colleges}
        departments={departments}
        batches={batches}
        submitting={submitting}
        onSubmit={handleCreateSubmit}
      />

      {/* View */}
      <AlumniViewDrawer
        open={!!viewTarget}
        onOpenChange={(v) => !v && setViewTarget(null)}
        alumni={viewTarget}
      />

      {/* Edit */}
      <AlumniEditDrawer
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        alumni={editTarget}
        colleges={colleges}
        departments={departments}
        batches={batches}
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
              This action cannot be undone. The user account and profile will
              be permanently removed.
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