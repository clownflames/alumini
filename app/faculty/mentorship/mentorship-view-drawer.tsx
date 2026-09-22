"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Target, User } from "lucide-react";
import { format } from "date-fns";
import {
  Mentorship,
  STATUS_LABELS,
  FOCUS_LABELS,
} from "./mentorship-types";

function statusVariant(s: Mentorship["status"]) {
  switch (s) {
    case "active":
      return "default" as const;
    case "pending":
      return "secondary" as const;
    case "completed":
      return "outline" as const;
    case "cancelled":
      return "destructive" as const;
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MentorshipViewDrawer({
  open,
  onOpenChange,
  mentorship,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mentorship: Mentorship | null;
}) {
  if (!mentorship) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] sm:max-w-none flex flex-col p-0 gap-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Mentorship Details</SheetTitle>
          <SheetDescription>
            {mentorship.mentorName} → {mentorship.menteeName}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusVariant(mentorship.status)}>
                {STATUS_LABELS[mentorship.status]}
              </Badge>
              <Badge variant="secondary">
                {FOCUS_LABELS[mentorship.focus]}
              </Badge>
            </div>

            {/* Mentor */}
            <div className="rounded-md border p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                MENTOR
              </p>
              <div className="flex items-start gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={mentorship.mentorImage || undefined} />
                  <AvatarFallback>
                    {mentorship.mentorName
                      ? initials(mentorship.mentorName)
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {mentorship.mentorName || "Unknown"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {mentorship.mentorHeadline ||
                      mentorship.mentorJobTitle ||
                      "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {mentorship.mentorEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Mentee */}
            <div className="rounded-md border p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                MENTEE
              </p>
              <div className="flex items-start gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={mentorship.menteeImage || undefined} />
                  <AvatarFallback>
                    {mentorship.menteeName
                      ? initials(mentorship.menteeName)
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {mentorship.menteeName || "Unknown"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {mentorship.menteeEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Goal */}
            {mentorship.goal && (
              <Section title="Goal">
                <div className="flex items-start gap-2">
                  <Target className="mt-0.5 size-4 text-muted-foreground" />
                  <p className="whitespace-pre-wrap text-sm">
                    {mentorship.goal}
                  </p>
                </div>
              </Section>
            )}

            {/* Request message */}
            {mentorship.requestMessage && (
              <Section title="Request Message">
                <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                  {mentorship.requestMessage}
                </p>
              </Section>
            )}

            {/* Timeline */}
            <Section title="Timeline">
              <Row
                icon={<Calendar className="size-4" />}
                label="Requested"
                value={format(
                  new Date(mentorship.createdAt),
                  "dd MMM yyyy, HH:mm"
                )}
              />
              {mentorship.startedAt && (
                <Row
                  icon={<Calendar className="size-4" />}
                  label="Started"
                  value={format(
                    new Date(mentorship.startedAt),
                    "dd MMM yyyy"
                  )}
                />
              )}
              {mentorship.endedAt && (
                <Row
                  icon={<Calendar className="size-4" />}
                  label="Ended"
                  value={format(
                    new Date(mentorship.endedAt),
                    "dd MMM yyyy"
                  )}
                />
              )}
            </Section>

            {/* Meta */}
            <Section title="Meta">
              <Row
                icon={<User className="size-4" />}
                label="Mentorship ID"
                value={mentorship.id}
              />
            </Section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-medium">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-all">{value || "—"}</p>
      </div>
    </div>
  );
}