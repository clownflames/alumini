"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentTable } from "./student-table";
import { StudentViewDrawer } from "./student-view-drawer";
import {
  StudentEditDrawer,
  type StudentEditFormValues,
} from "./student-edit-drawer";
import {
  StudentCreateDrawer,
  type StudentCreateFormValues,
} from "./student-create-drawer";
import type { Student } from "./student-types";
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

export function StudentsClient({
  initialStudents,
}: {
  initialStudents: Student[];
}) {
  const [students, setStudents] = useState(initialStudents);
  const [query, setQuery] = useState("");

  const [viewTarget, setViewTarget] = useState<Student | null>(null);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const refetch = async () => {
    const res = await fetch("/api/admin/student");
    const json = await res.json();
    if (json.success) setStudents(json.data);
  };

  /* ---------- CREATE ---------- */
  const handleCreateSubmit = async (values: StudentCreateFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/student/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      await refetch();
      toast.success("Student account created");
      setCreateOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- EDIT ---------- */
  const handleEditSubmit = async (values: StudentEditFormValues) => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/student/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      // If role changed away from "student", refetch (removes from list)
      await refetch();
      toast.success("Student updated");
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
      const res = await fetch(`/api/admin/student/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success("Student deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = query
    ? students.filter((s) => {
        const q = query.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
        );
      })
    : students;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            Manage student accounts in your college(s).
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          Create Student
        </Button>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />

      <StudentTable
        data={filtered}
        onView={(s) => setViewTarget(s)}
        onEdit={(s) => setEditTarget(s)}
        onDelete={(s) => setDeleteTarget(s)}
      />

      {/* Create */}
      <StudentCreateDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        submitting={submitting}
        onSubmit={handleCreateSubmit}
      />

      {/* View */}
      <StudentViewDrawer
        open={!!viewTarget}
        onOpenChange={(v) => !v && setViewTarget(null)}
        student={viewTarget}
      />

      {/* Edit */}
      <StudentEditDrawer
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        student={editTarget}
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
              This action cannot be undone. The student account will be
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