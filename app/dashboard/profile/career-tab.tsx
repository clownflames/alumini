"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import type { Experience } from "./profile-types";

type FormValues = {
  companyName: string;
  jobTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
};

const EMPTY: FormValues = {
  companyName: "",
  jobTitle: "",
  location: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  description: "",
};

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

export function CareerTab({
  initialExperience,
}: {
  initialExperience: Experience[];
}) {
  const [items, setItems] = useState(initialExperience);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Experience | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);

  const set = <K extends keyof FormValues>(key: K, v: FormValues[K]) =>
    setValues((s) => ({ ...s, [key]: v }));

  const openCreate = () => {
    setMode("create");
    setEditing(null);
    setValues(EMPTY);
    setDrawerOpen(true);
  };

  const openEdit = (e: Experience) => {
    setMode("edit");
    setEditing(e);
    setValues({
      companyName: e.companyName ?? "",
      jobTitle: e.jobTitle ?? "",
      location: e.location ?? "",
      startDate: toDateInput(e.startDate),
      endDate: toDateInput(e.endDate),
      currentlyWorking: e.currentlyWorking,
      description: e.description ?? "",
    });
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.companyName.trim() || !values.jobTitle.trim()) {
      toast.error("Company name and job title are required");
      return;
    }

    setSubmitting(true);
    try {
      const url =
        mode === "create"
          ? "/api/alumni/experience"
          : `/api/alumni/experience/${editing!.id}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      toast.success(
        mode === "create" ? "Experience added" : "Experience updated"
      );
      setDrawerOpen(false);

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
        `/api/alumni/experience/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      toast.success("Experience deleted");
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
          <h2 className="text-lg font-medium">Work Experience</h2>
          <p className="text-sm text-muted-foreground">
            Add your professional background.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Add Experience
        </Button>
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-12 text-center">
          <Briefcase className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No experience entries yet.
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
              <h3 className="font-medium">{e.jobTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {e.companyName}
                {e.location ? ` · ${e.location}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {e.startDate
                  ? new Date(e.startDate).toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
                {" – "}
                {e.currentlyWorking
                  ? "Present"
                  : e.endDate
                    ? new Date(e.endDate).toLocaleDateString("en-GB", {
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
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
          className="h-[75vh] sm:max-w-none flex flex-col p-0 gap-0"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SheetHeader className="shrink-0 border-b px-6 py-4">
            <SheetTitle>
              {mode === "create" ? "Add Experience" : "Edit Experience"}
            </SheetTitle>
            <SheetDescription>
              Fill in your professional details.
            </SheetDescription>
          </SheetHeader>

          <form
            id="exp-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-4"
          >
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={values.jobTitle}
                    onChange={(e) => set("jobTitle", e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Company *</Label>
                  <Input
                    id="companyName"
                    value={values.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                    placeholder="Google"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={values.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Bangalore, India"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={values.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={values.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    disabled={values.currentlyWorking}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-md border p-3">
                <Switch
                  checked={values.currentlyWorking}
                  onCheckedChange={(v) => {
                    set("currentlyWorking", v);
                    if (v) set("endDate", "");
                  }}
                />
                <div>
                  <Label className="cursor-pointer">
                    Currently working here
                  </Label>
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
            <Button type="submit" form="exp-form" disabled={submitting}>
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
            <AlertDialogTitle>Delete this experience?</AlertDialogTitle>
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