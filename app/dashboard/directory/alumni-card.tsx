"use client";

import {
  BadgeCheck,
  Briefcase,
  MapPin,
  Heart,
  UserPlus,
  Clock,
  Check,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { AlumniDirectoryItem } from "./directory-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AlumniCard({
  alumni,
  onConnect,
  onMessage,
  connecting,
}: {
  alumni: AlumniDirectoryItem;
  onConnect: (a: AlumniDirectoryItem) => void;
  onMessage: (a: AlumniDirectoryItem) => void;
  connecting: boolean;
}) {
  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Avatar + name */}
        <div className="flex items-start gap-3">
          <Avatar className="size-12 shrink-0">
            <AvatarImage src={alumni.image || undefined} />
            <AvatarFallback>{initials(alumni.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h3 className="truncate font-medium">{alumni.name}</h3>
              {alumni.isVerified && (
                <BadgeCheck className="size-4 shrink-0 text-primary" />
              )}
            </div>
            {alumni.headline && (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {alumni.headline}
              </p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-xs text-muted-foreground">
          {alumni.currentJobTitle && (
            <div className="flex items-center gap-2">
              <Briefcase className="size-3.5 shrink-0" />
              <span className="line-clamp-1">
                {alumni.currentJobTitle}
              </span>
            </div>
          )}
          {(alumni.city || alumni.country) && (
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0" />
              <span className="line-clamp-1">
                {[alumni.city, alumni.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {(alumni.collegeName ||
            alumni.departmentName ||
            alumni.batchYear) && (
            <div className="line-clamp-1">
              {[alumni.departmentName, alumni.collegeName, alumni.batchYear]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
        </div>

        {/* Badges */}
        {(alumni.isMentor || alumni.isOpenToWork) && (
          <div className="flex flex-wrap gap-1.5">
            {alumni.isMentor && (
              <Badge variant="secondary" className="text-xs">
                <Heart className="mr-1 size-3" />
                Mentor
              </Badge>
            )}
            {alumni.isOpenToWork && (
              <Badge variant="secondary" className="text-xs">
                Open to work
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2">
          {alumni.connectionStatus === "none" && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onConnect(alumni)}
              disabled={connecting}
            >
              <UserPlus className="mr-1.5 size-3.5" />
              Connect
            </Button>
          )}

          {alumni.connectionStatus === "pending_sent" && (
            <Button size="sm" variant="outline" className="flex-1" disabled>
              <Clock className="mr-1.5 size-3.5" />
              Request Sent
            </Button>
          )}

          {alumni.connectionStatus === "pending_received" && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onConnect(alumni)}
              disabled={connecting}
            >
              <Check className="mr-1.5 size-3.5" />
              Accept
            </Button>
          )}

          {alumni.connectionStatus === "accepted" && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onMessage(alumni)}
            >
              <MessageSquare className="mr-1.5 size-3.5" />
              Message
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}