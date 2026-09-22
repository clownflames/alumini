"use client";

import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Video,
  Check,
  Clock,
  ExternalLink,
  Loader2,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Event,
  EVENT_TYPE_LABELS,
  EVENT_STATUS_LABELS,
} from "./event-types";

function statusVariant(status: Event["status"]) {
  switch (status) {
    case "published":
      return "default" as const;
    case "cancelled":
      return "destructive" as const;
    case "completed":
      return "outline" as const;
  }
}

export function EventViewDrawer({
  open,
  onOpenChange,
  event,
  onRegister,
  busy,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  event: Event | null;
  onRegister: (e: Event) => void;
  busy: boolean;
}) {
  if (!event) return null;

  const isPast = new Date(event.startAt) < new Date();
  const canRegister = !isPast && event.status === "published";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] sm:max-w-none flex flex-col p-0 gap-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Event Details</SheetTitle>
          <SheetDescription>{event.title}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <Badge variant={statusVariant(event.status)}>
                  {EVENT_STATUS_LABELS[event.status]}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {EVENT_TYPE_LABELS[event.eventType]}
                </Badge>
                {event.isRegistered && (
                  <Badge>
                    <Check className="mr-1 size-3" />
                    Registered
                  </Badge>
                )}
              </div>
            </div>

            {event.coverImage && (
              <img
                src={event.coverImage}
                alt={event.title}
                className="max-h-64 w-full rounded-md object-cover"
              />
            )}

            {event.description && (
              <Section title="Description">
                <p className="whitespace-pre-wrap text-sm">
                  {event.description}
                </p>
              </Section>
            )}

            <Section title="Schedule">
              <Row
                icon={<Calendar className="size-4" />}
                label="Start"
                value={format(
                  new Date(event.startAt),
                  "dd MMM yyyy, HH:mm"
                )}
              />
              {event.endAt && (
                <Row
                  icon={<Clock className="size-4" />}
                  label="End"
                  value={format(
                    new Date(event.endAt),
                    "dd MMM yyyy, HH:mm"
                  )}
                />
              )}
            </Section>

            <Section title="Venue">
              {event.location && (
                <Row
                  icon={<MapPin className="size-4" />}
                  label="Location"
                  value={event.location}
                />
              )}
              {event.meetingUrl && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 text-muted-foreground">
                    <Video className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      Meeting URL
                    </p>
                    <a
                      href={event.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      Join online
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              )}
              {event.collegeName && (
                <Row
                  icon={<Building2 className="size-4" />}
                  label="College"
                  value={event.collegeName}
                />
              )}
            </Section>

            <Section title="Registration">
              <Row
                icon={<Users className="size-4" />}
                label="Registered"
                value={`${event.registrationCount}${
                  event.maxAttendees ? ` / ${event.maxAttendees}` : ""
                }`}
              />
            </Section>
          </div>
        </div>

        {/* Footer actions */}
        {canRegister && (
          <div className="shrink-0 border-t px-6 py-4">
            {event.isRegistered ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onRegister(event)}
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Check className="mr-2 size-4" />
                )}
                You're Registered · Cancel
              </Button>
            ) : event.isFull ? (
              <Button className="w-full" disabled>
                Event Full
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => onRegister(event)}
                disabled={busy}
              >
                {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                Register for this Event
              </Button>
            )}
          </div>
        )}
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