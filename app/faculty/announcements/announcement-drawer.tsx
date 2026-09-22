"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  Announcement,
  AnnouncementAudience,
  AnnouncementPriority,
  College,
} from "./announcement-types";

export type AnnouncementFormValues = {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  isPinned: boolean;
  isPublished: boolean;
  expiresAt: string;
  collegeId: string;
};

const EMPTY: AnnouncementFormValues = {
  title: "",
  content: "",
  priority: "normal",
  audience: "all",
  isPinned: false,
  isPublished: false,
  expiresAt: "",
  collegeId: "",
};

function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function AnnouncementDrawer({
  open,
  onOpenChange,
  mode,
  announcement,
  colleges,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  announcement: Announcement | null;
  colleges: College[];
  submitting: boolean;
  onSubmit: (values: AnnouncementFormValues) => void;
}) {
  const [values, setValues] = useState<AnnouncementFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && announcement) {
      setValues({
        title: announcement.title ?? "",
        content: announcement.content ?? "",
        priority: announcement.priority,
        audience: announcement.audience,
        isPinned: announcement.isPinned,
        isPublished: announcement.isPublished,
        expiresAt: isoToDateInput(announcement.expiresAt),
        collegeId: announcement.collegeId ?? "",
      });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
  }, [open, mode, announcement]);

  const set = <K extends keyof AnnouncementFormValues>(
    key: K,
    v: AnnouncementFormValues[K]
  ) => setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.title.trim()) errs.title = "Title is required";
    if (!values.content.trim()) errs.content = "Content is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] sm:max-w-none flex flex-col p-0 gap-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>
            {mode === "create" ? "Create Announcement" : "Edit Announcement"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Broadcast a message to your community."
              : "Update announcement details below."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="faculty-announcement-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Important update about campus events"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={values.content}
                onChange={(e) => set("content", e.target.value)}
                rows={6}
              />
              {errors.content && (
                <p className="text-xs text-destructive">{errors.content}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={values.priority}
                  onValueChange={(v) =>
                    set("priority", (v ?? "normal") as AnnouncementPriority)
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="audience">Audience</Label>
                <Select
                  value={values.audience}
                  onValueChange={(v) =>
                    set("audience", (v ?? "all") as AnnouncementAudience)
                  }
                >
                  <SelectTrigger id="audience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="collegeId">College</Label>
                <Select
                  value={values.collegeId || "none"}
                  onValueChange={(v) =>
                    set("collegeId", v === "none" || v === null ? "" : v)
                  }
                >
                  <SelectTrigger id="collegeId">
                    <SelectValue placeholder="Select college" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Colleges</SelectItem>
                    {colleges.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expiresAt">Expires On</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={values.expiresAt}
                  onChange={(e) => set("expiresAt", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-md border p-3">
                <Switch
                  id="isPinned"
                  checked={values.isPinned}
                  onCheckedChange={(v) => set("isPinned", v)}
                />
                <div>
                  <Label htmlFor="isPinned" className="cursor-pointer">
                    Pin to top
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show at the top of the list
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-md border p-3">
                <Switch
                  id="isPublished"
                  checked={values.isPublished}
                  onCheckedChange={(v) => set("isPublished", v)}
                />
                <div>
                  <Label htmlFor="isPublished" className="cursor-pointer">
                    Publish now
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Make visible to audience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        <SheetFooter className="shrink-0 border-t px-6 py-4 flex-row justify-end gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="faculty-announcement-form"
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}