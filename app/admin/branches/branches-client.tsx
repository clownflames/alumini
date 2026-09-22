"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BranchTable } from "./branch-table";
import { BranchDrawer, type BranchFormValues } from "./branch-drawer";
import { BranchConfirmDialog } from "./branch-dialog";
import type { Branch, Department } from "./branch-types";
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

export function BranchesClient({
  initialBranches,
  departments,
}: {
  initialBranches: Branch[];
  departments: Department[];
}) {
  const [branches, setBranches] = useState(initialBranches);
  const [query, setQuery] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Branch | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<BranchFormValues | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setDrawerMode("create");
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (b: Branch) => {
    setDrawerMode("edit");
    setEditing(b);
    setDrawerOpen(true);
  };

  const handleDrawerSubmit = (values: BranchFormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const refetch = async () => {
    const res = await fetch("/api/admin/branch");
    const json = await res.json();
    if (json.success) setBranches(json.data);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    setSubmitting(true);

    try {
      if (drawerMode === "create") {
        const res = await fetch("/api/admin/branch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Branch created");
      } else if (editing) {
        const res = await fetch(`/api/admin/branch/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Branch updated");
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

  const handleDelete = (b: Branch) => setDeleteTarget(b);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/branch/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setBranches((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      toast.success("Branch deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = query
    ? branches.filter(
        (b) =>
          b.name.toLowerCase().includes(query.toLowerCase()) ||
          (b.code || "").toLowerCase().includes(query.toLowerCase()) ||
          (b.departmentName || "").toLowerCase().includes(query.toLowerCase())
      )
    : branches;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Branches</h1>
          <p className="text-sm text-muted-foreground">
            Manage branches under each department.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Create New
        </Button>
      </div>

      <Input
        placeholder="Search by name, code or department..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      <BranchTable
        data={filtered}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <BranchDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        branch={editing}
        departments={departments}
        submitting={submitting}
        onSubmit={handleDrawerSubmit}
      />

      <BranchConfirmDialog
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
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              branch.
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