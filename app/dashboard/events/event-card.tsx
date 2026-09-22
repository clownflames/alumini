"use client";

import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Video,
  Check,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    default:
      return "secondary" as const;
  }
}

export function EventCard({
  event,
  onView,
  onRegister,
  busy,
}: {
  event: Event;
  onView: (e: Event) => void;
  onRegister: (e: Event) => void;
  busy: boolean;
}) {
  const isPast = new Date(event.startAt) < new Date();
  const canRegister = !isPast && event.status === "published";

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Cover */}
      {event.coverImage ? (
        <div className="relative aspect-video w-full overflow-hidden">
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-2 top-2 flex gap-1.5">
            <Badge variant="secondary">
              {EVENT_TYPE_LABELS[event.eventType]}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-muted">
          <Calendar className="size-10 text-muted-foreground" />
        </div>
      )}

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Title + Status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-medium">{event.title}</h3>
          <Badge variant={statusVariant(event.status)}>
            {EVENT_STATUS_LABELS[event.status]}
          </Badge>
        </div>

        {/* Meta */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 shrink-0" />
            <span>
              {format(new Date(event.startAt), "dd MMM yyyy, HH:mm")}
            </span>
          </div>

          {event.endAt && (
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 shrink-0" />
              <span>
                Ends {format(new Date(event.endAt), "dd MMM, HH:mm")}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          {event.meetingUrl && (
            <div className="flex items-center gap-2">
              <Video className="size-3.5 shrink-0" />
              <span className="line-clamp-1">Online event</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="size-3.5 shrink-0" />
            <span>
              {event.registrationCount} registered
              {event.maxAttendees && ` / ${event.maxAttendees}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(event)}
          >
            Details
          </Button>

          {canRegister && (
            <>
              {event.isRegistered ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onRegister(event)}
                  disabled={busy}
                >
                  {busy ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <Check className="mr-1.5 size-3.5" />
                  )}
                  Registered
                </Button>
              ) : event.isFull ? (
                <Button size="sm" className="flex-1" disabled>
                  Event Full
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onRegister(event)}
                  disabled={busy}
                >
                  {busy && (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  )}
                  Register
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}