"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollegeTable } from "./college-table";
import {
  CollegeDrawer,
  type CollegeFormValues,
} from "./college-drawer";
import { CollegeConfirmDialog } from "./college-dialog";
import type { College } from "./college-columns";
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
import { Loader2 } from "lucide-react";

export function CollegesTab({
  initialColleges,
}: {
  initialColleges: College[];
}) {
  const [colleges, setColleges] = useState(initialColleges);
  const [query, setQuery] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<College | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<CollegeFormValues | null>(
    null
  );

  const [deleteTarget, setDeleteTarget] = useState<College | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setDrawerMode("create");
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (c: College) => {
    setDrawerMode("edit");
    setEditing(c);
    setDrawerOpen(true);
  };

  const handleDrawerSubmit = (values: CollegeFormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    setSubmitting(true);

    try {
      if (drawerMode === "create") {
        const res = await fetch("/api/admin/college", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        const listRes = await fetch("/api/admin/college");
        const listJson = await listRes.json();
        setColleges(listJson.data);

        toast.success("College created");
      } else if (editing) {
        const res = await fetch(`/api/admin/college/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        setColleges((prev) =>
          prev.map((c) =>
            c.id === editing.id
              ? {
                  ...c,
                  ...pendingValues,
                  country: pendingValues.country || "India",
                }
              : c
          )
        );

        toast.success("College updated");
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

  const handleDelete = (c: College) => setDeleteTarget(c);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/college/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setColleges((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success("College deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = query
    ? colleges.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          (c.shortName || "").toLowerCase().includes(query.toLowerCase()) ||
          (c.city || "").toLowerCase().includes(query.toLowerCase())
      )
    : colleges;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Colleges</h2>
          <p className="text-sm text-muted-foreground">
            Add and manage colleges on the platform.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Add College
        </Button>
      </div>

      <Input
        placeholder="Search by name, short name or city..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      <CollegeTable
        data={filtered}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <CollegeDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        college={editing}
        submitting={submitting}
        onSubmit={handleDrawerSubmit}
      />

      <CollegeConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={submitting}
        mode={drawerMode}
        onConfirm={handleConfirm}
      />

      {/* Delete confirm */}
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
              This action cannot be undone. This will permanently delete the
              college. Departments, batches and related records may become
              orphaned.
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