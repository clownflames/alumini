"use client";

import {
  BadgeCheck,
  Briefcase,
  MapPin,
  UserCheck,
  UserPlus,
  X,
  Trash2,
  Clock,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Connection } from "./connection-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ConnectionCard({
  connection,
  onAccept,
  onReject,
  onRemove,
  onMessage,
  busy,
}: {
  connection: Connection;
  onAccept: (c: Connection) => void;
  onReject: (c: Connection) => void;
  onRemove: (c: Connection) => void;
  onMessage: (c: Connection) => void;
  busy: boolean;
}) {
  const isPending = connection.status === "pending";
  const isAccepted = connection.status === "accepted";
  const isReceivedPending = isPending && connection.direction === "received";
  const isSentPending = isPending && connection.direction === "sent";

  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        {/* Avatar */}
        <Avatar className="size-12 shrink-0">
          <AvatarImage src={connection.otherImage || undefined} />
          <AvatarFallback>
            {initials(connection.otherName)}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h3 className="truncate font-medium">
              {connection.otherName}
            </h3>
            {connection.otherHeadline && (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {connection.otherHeadline}
              </p>
            )}
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            {connection.otherJobTitle && (
              <div className="flex items-center gap-2">
                <Briefcase className="size-3.5 shrink-0" />
                <span className="truncate">
                  {connection.otherJobTitle}
                </span>
              </div>
            )}
            {connection.otherCity && (
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{connection.otherCity}</span>
              </div>
            )}
          </div>

          {/* Status badge */}
          {isSentPending && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="mr-1 size-3" />
              Request Sent
            </Badge>
          )}
          {isReceivedPending && (
            <Badge variant="default" className="text-xs">
              <UserPlus className="mr-1 size-3" />
              Wants to connect
            </Badge>
          )}
          {isAccepted && (
            <Badge variant="default" className="text-xs">
              <UserCheck className="mr-1 size-3" />
              Connected
            </Badge>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {isReceivedPending && (
              <>
                <Button
                  size="sm"
                  onClick={() => onAccept(connection)}
                  disabled={busy}
                >
                  <UserCheck className="mr-1.5 size-3.5" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(connection)}
                  disabled={busy}
                >
                  <X className="mr-1.5 size-3.5" />
                  Reject
                </Button>
              </>
            )}

            {isSentPending && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemove(connection)}
                disabled={busy}
              >
                <X className="mr-1.5 size-3.5" />
                Cancel Request
              </Button>
            )}

            {isAccepted && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMessage(connection)}
                >
                  <MessageSquare className="mr-1.5 size-3.5" />
                  Message
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onRemove(connection)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Remove connection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}