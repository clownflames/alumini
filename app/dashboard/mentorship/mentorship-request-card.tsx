"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Check,
  X,
  Clock,
  Target,
  Loader2,
  User,
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

export function MentorshipRequestCard({
  mentorship,
  onAccept,
  onReject,
  onCancel,
  busy,
}: {
  mentorship: Mentorship;
  onAccept: (m: Mentorship) => void;
  onReject: (m: Mentorship) => void;
  onCancel: (m: Mentorship) => void;
  busy: boolean;
}) {
  // If I'm mentee and this is pending, it's an outgoing request
  const isOutgoing = mentorship.role === "mentee";
  const isIncoming = mentorship.role === "mentor";

  const otherName = isOutgoing
    ? mentorship.mentorName
    : mentorship.menteeName;
  const otherImage = isOutgoing
    ? mentorship.mentorImage
    : mentorship.menteeImage;

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
                {isOutgoing ? "You requested mentorship" : "Wants your mentorship"}
              </p>
            </div>
            <Badge variant="secondary">{STATUS_LABELS[mentorship.status]}</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {FOCUS_LABELS[mentorship.focus]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(mentorship.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {mentorship.goal && (
            <div className="flex items-start gap-2 text-sm">
              <Target className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="line-clamp-2">{mentorship.goal}</p>
            </div>
          )}

          {mentorship.requestMessage && (
            <div className="rounded-md bg-muted p-2 text-xs">
              <p className="line-clamp-3">{mentorship.requestMessage}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {isIncoming && mentorship.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => onAccept(mentorship)}
                  disabled={busy}
                >
                  {busy ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <Check className="mr-1.5 size-3.5" />
                  )}
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(mentorship)}
                  disabled={busy}
                >
                  <X className="mr-1.5 size-3.5" />
                  Decline
                </Button>
              </>
            )}

            {isOutgoing && mentorship.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancel(mentorship)}
                disabled={busy}
              >
                <X className="mr-1.5 size-3.5" />
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}