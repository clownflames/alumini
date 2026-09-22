"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BatchTable } from "./batch-table";
import { BatchDrawer, type BatchFormValues } from "./batch-drawer";
import { BatchConfirmDialog } from "./batch-dialog";
import type { Batch, College } from "./batch-types";
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

export function BatchesClient({
  initialBatches,
  colleges,
}: {
  initialBatches: Batch[];
  colleges: College[];
}) {
  const [batches, setBatches] = useState(initialBatches);
  const [query, setQuery] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Batch | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<BatchFormValues | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setDrawerMode("create");
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (b: Batch) => {
    setDrawerMode("edit");
    setEditing(b);
    setDrawerOpen(true);
  };

  const handleDrawerSubmit = (values: BatchFormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const refetch = async () => {
    const res = await fetch("/api/admin/batch");
    const json = await res.json();
    if (json.success) setBatches(json.data);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    setSubmitting(true);

    try {
      if (drawerMode === "create") {
        const res = await fetch("/api/admin/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Batch created");
      } else if (editing) {
        const res = await fetch(`/api/admin/batch/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Batch updated");
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

  const handleDelete = (b: Batch) => setDeleteTarget(b);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/batch/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setBatches((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      toast.success("Batch deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = query
    ? batches.filter((b) => {
        const q = query.toLowerCase();
        return (
          String(b.year).includes(q) ||
          (b.collegeName || "").toLowerCase().includes(q)
        );
      })
    : batches;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Batches</h1>
          <p className="text-sm text-muted-foreground">
            Manage graduation batches per college.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Create New
        </Button>
      </div>

      <Input
        placeholder="Search by year or college..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      <BatchTable
        data={filtered}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <BatchDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        batch={editing}
        colleges={colleges}
        submitting={submitting}
        onSubmit={handleDrawerSubmit}
      />

      <BatchConfirmDialog
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
            <AlertDialogTitle>
              Delete batch {deleteTarget?.year}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Alumni profiles linked to this
              batch will keep their record but lose the batch reference.
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