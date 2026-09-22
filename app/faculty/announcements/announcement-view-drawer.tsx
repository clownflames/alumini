"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building2, Pin } from "lucide-react";
import { format } from "date-fns";
import {
  Announcement,
  PRIORITY_LABELS,
  AUDIENCE_LABELS,
} from "./announcement-types";

function priorityVariant(p: Announcement["priority"]) {
  switch (p) {
    case "urgent":
      return "destructive" as const;
    case "high":
      return "default" as const;
    case "low":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

export function AnnouncementViewDrawer({
  open,
  onOpenChange,
  announcement,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  announcement: Announcement | null;
}) {
  if (!announcement) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[80vh] sm:max-w-none flex flex-col p-0 gap-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Announcement Details</SheetTitle>
          <SheetDescription>{announcement.title}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start gap-2">
                {announcement.isPinned && (
                  <Pin
                    className="mt-1 size-4 shrink-0 text-primary"
                    fill="currentColor"
                  />
                )}
                <h3 className="text-lg font-semibold">
                  {announcement.title}
                </h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={priorityVariant(announcement.priority)}>
                  {PRIORITY_LABELS[announcement.priority]}
                </Badge>
                <Badge variant="secondary">
                  {AUDIENCE_LABELS[announcement.audience]}
                </Badge>
                <Badge
                  variant={announcement.isPublished ? "default" : "secondary"}
                >
                  {announcement.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <Section title="Content">
              <p className="whitespace-pre-wrap text-sm">
                {announcement.content}
              </p>
            </Section>

            {/* Schedule */}
            <Section title="Schedule">
              {announcement.publishedAt && (
                <Row
                  icon={<Calendar className="size-4" />}
                  label="Published"
                  value={format(
                    new Date(announcement.publishedAt),
                    "dd MMM yyyy, HH:mm"
                  )}
                />
              )}
              {announcement.expiresAt && (
                <Row
                  icon={<Calendar className="size-4" />}
                  label="Expires"
                  value={format(
                    new Date(announcement.expiresAt),
                    "dd MMM yyyy, HH:mm"
                  )}
                />
              )}
            </Section>

            {/* College */}
            {announcement.collegeName && (
              <Section title="College">
                <Row
                  icon={<Building2 className="size-4" />}
                  label="Posted for"
                  value={announcement.collegeName}
                />
              </Section>
            )}

            {/* Meta */}
            <Section title="Meta">
              <Row label="Announcement ID" value={announcement.id} />
              <Row
                label="Created"
                value={format(
                  new Date(announcement.createdAt),
                  "dd MMM yyyy"
                )}
              />
              <Row
                label="Last Updated"
                value={format(
                  new Date(announcement.updatedAt),
                  "dd MMM yyyy"
                )}
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