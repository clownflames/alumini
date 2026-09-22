"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DepartmentTable } from "./department-table";
import {
  DepartmentDrawer,
  type DepartmentFormValues,
} from "./department-drawer";
import { DepartmentConfirmDialog } from "./department-dialog";
import type { Department } from "./department-columns";

type College = { id: string; name: string };

export function DepartmentClient({
  initialDepartments,
  colleges,
}: {
  initialDepartments: Department[];
  colleges: College[];
}) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [query, setQuery] = useState("");

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Department | null>(null);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<DepartmentFormValues | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const [submitting, setSubmitting] = useState(false);

  /* ---------- Open create ---------- */
  const openCreate = () => {
    setDrawerMode("create");
    setEditing(null);
    setDrawerOpen(true);
  };

  /* ---------- Open edit ---------- */
  const openEdit = (d: Department) => {
    setDrawerMode("edit");
    setEditing(d);
    setDrawerOpen(true);
  };

  /* ---------- Drawer submit → open confirm ---------- */
  const handleDrawerSubmit = (values: DepartmentFormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  /* ---------- Confirmed → call API ---------- */
  const handleConfirm = async () => {
    if (!pendingValues) return;
    setSubmitting(true);

    try {
      if (drawerMode === "create") {
        const res = await fetch("/api/admin/department", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();

        if (!res.ok || !json.success) throw new Error(json.error);

        // refetch fresh list (server shape returns only collegeId)
        const listRes = await fetch("/api/admin/department");
        const listJson = await listRes.json();
        setDepartments(listJson.data);

        toast.success("Department created");
      } else if (editing) {
        const res = await fetch(`/api/admin/department/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();

        if (!res.ok || !json.success) throw new Error(json.error);

        setDepartments((prev) =>
          prev.map((d) =>
            d.id === editing.id
              ? {
                  ...d,
                  name: pendingValues.name,
                  code: pendingValues.code || null,
                  description: pendingValues.description || null,
                }
              : d
          )
        );

        toast.success("Department updated");
      }

      // close everything
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

  /* ---------- Delete flow ---------- */
  const handleDelete = (d: Department) => setDeleteTarget(d);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/department/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setDepartments((prev) =>
        prev.filter((d) => d.id !== deleteTarget.id)
      );
      toast.success("Department deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = query
    ? departments.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          (d.code || "").toLowerCase().includes(query.toLowerCase())
      )
    : departments;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Departments</h1>
          <p className="text-sm text-muted-foreground">
            Manage departments across your colleges.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Create New
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by name or code..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {/* Table */}
      <DepartmentTable
        data={filtered}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Drawer */}
      <DepartmentDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        department={editing}
        colleges={colleges}
        submitting={submitting}
        onSubmit={handleDrawerSubmit}
      />

      {/* Confirm dialog for create/edit */}
      <DepartmentConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={submitting}
        mode={drawerMode}
        onConfirm={handleConfirm}
      />

      {/* Confirm dialog for delete */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        loading={submitting}
        name={deleteTarget?.name || ""}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

/* ---------- Small inline delete confirm ---------- */
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

function DeleteConfirmDialog({
  open,
  onOpenChange,
  loading,
  name,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  loading: boolean;
  name: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            department.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}