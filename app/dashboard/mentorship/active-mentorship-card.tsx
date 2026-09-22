"use client";

import { format } from "date-fns";
import {
  Check,
  Calendar,
  Target,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mentorship, FOCUS_LABELS, STATUS_LABELS } from "./mentorship-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ActiveMentorshipCard({
  mentorship,
  onComplete,
  onCancel,
  onMessage,
  busy,
}: {
  mentorship: Mentorship;
  onComplete: (m: Mentorship) => void;
  onCancel: (m: Mentorship) => void;
  onMessage: (m: Mentorship) => void;
  busy: boolean;
}) {
  const otherName =
    mentorship.role === "mentor"
      ? mentorship.menteeName
      : mentorship.mentorName;
  const otherImage =
    mentorship.role === "mentor"
      ? mentorship.menteeImage
      : mentorship.mentorImage;

  const isMentor = mentorship.role === "mentor";
  const isActive = mentorship.status === "active";
  const isCompleted = mentorship.status === "completed";

  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <Avatar className="size-12 shrink-0">
          <AvatarImage src={otherImage || undefined} />
          <AvatarFallback>{initials(otherName)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium">{otherName}</h3>
              <p className="text-xs text-muted-foreground">
                {isMentor ? "You are mentoring" : "You are being mentored"}
              </p>
            </div>
            <Badge variant={isActive ? "default" : "outline"}>
              {STATUS_LABELS[mentorship.status]}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {FOCUS_LABELS[mentorship.focus]}
            </Badge>
            {mentorship.startedAt && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                Started{" "}
                {format(new Date(mentorship.startedAt), "dd MMM yyyy")}
              </span>
            )}
            {mentorship.endedAt && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Check className="size-3" />
                Ended{" "}
                {format(new Date(mentorship.endedAt), "dd MMM yyyy")}
              </span>
            )}
          </div>

          {mentorship.goal && (
            <div className="flex items-start gap-2 text-sm">
              <Target className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="line-clamp-2">{mentorship.goal}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {isActive && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMessage(mentorship)}
                >
                  <MessageSquare className="mr-1.5 size-3.5" />
                  Message
                </Button>

                {isMentor && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onComplete(mentorship)}
                    disabled={busy}
                  >
                    {busy ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                      <Check className="mr-1.5 size-3.5" />
                    )}
                    Mark Complete
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCancel(mentorship)}
                  disabled={busy}
                  className="text-destructive hover:text-destructive"
                >
                  Cancel
                </Button>
              </>
            )}

            {isCompleted && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMessage(mentorship)}
              >
                <MessageSquare className="mr-1.5 size-3.5" />
                Message
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}