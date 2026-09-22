"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import type { Education } from "./profile-types";

type FormValues = {
  collegeName: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  description: string;
};

const EMPTY: FormValues = {
  collegeName: "",
  degree: "",
  fieldOfStudy: "",
  startYear: "",
  endYear: "",
  description: "",
};

export function EducationTab({
  initialEducation,
}: {
  initialEducation: Education[];
}) {
  const [items, setItems] = useState(initialEducation);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Education | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Education | null>(null);

  const set = <K extends keyof FormValues>(key: K, v: FormValues[K]) =>
    setValues((s) => ({ ...s, [key]: v }));

  const openCreate = () => {
    setMode("create");
    setEditing(null);
    setValues(EMPTY);
    setErrors({});
    setDrawerOpen(true);
  };

  const openEdit = (e: Education) => {
    setMode("edit");
    setEditing(e);
    setValues({
      collegeName: e.collegeName ?? "",
      degree: e.degree ?? "",
      fieldOfStudy: e.fieldOfStudy ?? "",
      startYear: e.startYear != null ? String(e.startYear) : "",
      endYear: e.endYear != null ? String(e.endYear) : "",
      description: e.description ?? "",
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.collegeName.trim())
      errs.collegeName = "College name is required";
    if (
      values.startYear &&
      values.endYear &&
      Number(values.startYear) > Number(values.endYear)
    ) {
      errs.endYear = "End year must be ≥ start year";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const url =
        mode === "create"
          ? "/api/alumni/education"
          : `/api/alumni/education/${editing!.id}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      toast.success(
        mode === "create" ? "Education added" : "Education updated"
      );
      setDrawerOpen(false);

      // Refetch
      const listRes = await fetch("/api/alumni/education");
      // If no list endpoint, just update locally:
      if (mode === "create") {
        setItems((prev) => [json.data, ...prev]);
      } else {
        setItems((prev) =>
          prev.map((x) => (x.id === json.data.id ? json.data : x))
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/alumni/education/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast.success("Education deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Education</h2>
          <p className="text-sm text-muted-foreground">
            Add your academic background.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Add Education
        </Button>
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-12 text-center">
          <GraduationCap className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No education entries yet.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((e) => (
          <div
            key={e.id}
            className="flex items-start justify-between gap-4 rounded-md border p-4"
          >
            <div className="flex-1">
              <h3 className="font-medium">{e.collegeName}</h3>
              <p className="text-sm text-muted-foreground">
                {[e.degree, e.fieldOfStudy].filter(Boolean).join(" · ") ||
                  "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {e.startYear && e.endYear
                  ? `${e.startYear} – ${e.endYear}`
                  : e.startYear
                    ? `From ${e.startYear}`
                    : e.endYear
                      ? `Till ${e.endYear}`
                      : "—"}
              </p>
              {e.description && (
                <p className="mt-2 text-sm">{e.description}</p>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(e)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteTarget(e)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="bottom"
          className="h-[70vh] sm:max-w-none flex flex-col p-0 gap-0"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SheetHeader className="shrink-0 border-b px-6 py-4">
            <SheetTitle>
              {mode === "create" ? "Add Education" : "Edit Education"}
            </SheetTitle>
            <SheetDescription>
              Fill in your academic details below.
            </SheetDescription>
          </SheetHeader>

          <form
            id="edu-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-4"
          >
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="collegeName">College / University *</Label>
                <Input
                  id="collegeName"
                  value={values.collegeName}
                  onChange={(e) => set("collegeName", e.target.value)}
                  placeholder="IIT Delhi"
                />
                {errors.collegeName && (
                  <p className="text-xs text-destructive">
                    {errors.collegeName}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    value={values.degree}
                    onChange={(e) => set("degree", e.target.value)}
                    placeholder="B.Tech"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input
                    id="fieldOfStudy"
                    value={values.fieldOfStudy}
                    onChange={(e) => set("fieldOfStudy", e.target.value)}
                    placeholder="Computer Science"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="startYear">Start Year</Label>
                  <Input
                    id="startYear"
                    type="number"
                    min={1900}
                    max={2100}
                    value={values.startYear}
                    onChange={(e) => set("startYear", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endYear">End Year</Label>
                  <Input
                    id="endYear"
                    type="number"
                    min={1900}
                    max={2100}
                    value={values.endYear}
                    onChange={(e) => set("endYear", e.target.value)}
                  />
                  {errors.endYear && (
                    <p className="text-xs text-destructive">
                      {errors.endYear}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </form>

          <SheetFooter className="shrink-0 border-t px-6 py-4 flex-row justify-end gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" form="edu-form" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "create" ? "Add" : "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this education entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
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