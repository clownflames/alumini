"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { College, Event, EventStatus, EventType } from "./event-types";

export type EventFormValues = {
  title: string;
  description: string;
  coverImage: string;
  eventType: EventType;
  status: EventStatus;
  startAt: string;
  endAt: string;
  location: string;
  meetingUrl: string;
  maxAttendees: string;
  collegeId: string;
};

const EMPTY: EventFormValues = {
  title: "",
  description: "",
  coverImage: "",
  eventType: "in_person",
  status: "draft",
  startAt: "",
  endAt: "",
  location: "",
  meetingUrl: "",
  maxAttendees: "",
  collegeId: "",
};

function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventDrawer({
  open,
  onOpenChange,
  mode,
  event,
  colleges,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  event: Event | null;
  colleges: College[];
  submitting: boolean;
  onSubmit: (values: EventFormValues) => void;
}) {
  const [values, setValues] = useState<EventFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && event) {
      setValues({
        title: event.title ?? "",
        description: event.description ?? "",
        coverImage: event.coverImage ?? "",
        eventType: event.eventType,
        status: event.status,
        startAt: isoToLocalInput(event.startAt),
        endAt: isoToLocalInput(event.endAt),
        location: event.location ?? "",
        meetingUrl: event.meetingUrl ?? "",
        maxAttendees:
          event.maxAttendees !== null && event.maxAttendees !== undefined
            ? String(event.maxAttendees)
            : "",
        collegeId: event.collegeId ?? "",
      });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
  }, [open, mode, event]);

  const set = <K extends keyof EventFormValues>(
    key: K,
    v: EventFormValues[K]
  ) => setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.title.trim()) errs.title = "Title is required";
    if (!values.startAt) errs.startAt = "Start date is required";
    if (
      values.endAt &&
      values.startAt &&
      new Date(values.endAt) < new Date(values.startAt)
    ) {
      errs.endAt = "End must be after start";
    }
    if (values.eventType === "online" && !values.meetingUrl.trim()) {
      errs.meetingUrl = "Meeting URL required for online events";
    }
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
            {mode === "create" ? "Create Event" : "Edit Event"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a new event for your college."
              : "Update event details below."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="faculty-event-form"
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
                placeholder="Annual Alumni Meet 2026"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select
                  value={values.eventType}
                  onValueChange={(v) => set("eventType", (v ?? "in_person") as EventType)}
                >
                  <SelectTrigger id="eventType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={values.status}
                  onValueChange={(v) => set("status", (v ?? "draft") as EventStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="startAt">Start *</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={values.startAt}
                  onChange={(e) => set("startAt", e.target.value)}
                />
                {errors.startAt && (
                  <p className="text-xs text-destructive">{errors.startAt}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endAt">End</Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={values.endAt}
                  onChange={(e) => set("endAt", e.target.value)}
                />
                {errors.endAt && (
                  <p className="text-xs text-destructive">{errors.endAt}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={values.location}
                  onChange={(e) => set("location", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="meetingUrl">Meeting URL</Label>
                <Input
                  id="meetingUrl"
                  value={values.meetingUrl}
                  onChange={(e) => set("meetingUrl", e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
                {errors.meetingUrl && (
                  <p className="text-xs text-destructive">
                    {errors.meetingUrl}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="maxAttendees">Max Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  min={1}
                  value={values.maxAttendees}
                  onChange={(e) => set("maxAttendees", e.target.value)}
                />
              </div>
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
                    <SelectItem value="none">None</SelectItem>
                    {colleges.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                value={values.coverImage}
                onChange={(e) => set("coverImage", e.target.value)}
                placeholder="https://..."
              />
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
            form="faculty-event-form"
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