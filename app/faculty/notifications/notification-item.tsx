"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  UserPlus,
  MessageSquare,
  Calendar,
  Briefcase,
  FileText,
  Check,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Notification,
  NotificationType,
  TYPE_LABELS,
} from "./notification-types";

function iconFor(type: NotificationType) {
  switch (type) {
    case "connection":
      return UserPlus;
    case "message":
      return MessageSquare;
    case "event":
      return Calendar;
    case "job":
      return Briefcase;
    case "post":
      return FileText;
    default:
      return Bell;
  }
}

export function NotificationItem({
  notification,
  onToggleRead,
  onDelete,
}: {
  notification: Notification;
  onToggleRead: (n: Notification) => void;
  onDelete: (n: Notification) => void;
}) {
  const Icon = iconFor(notification.type);

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-md border p-4 transition-colors",
        !notification.isRead && "bg-accent/40"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "rounded-md p-2",
          notification.isRead ? "bg-muted" : "bg-primary/10"
        )}
      >
        <Icon
          className={cn(
            "size-4",
            notification.isRead
              ? "text-muted-foreground"
              : "text-primary"
          )}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-medium">
                {notification.title}
              </h4>
              {!notification.isRead && (
                <span className="size-2 shrink-0 rounded-full bg-primary" />
              )}
            </div>
            {notification.message && (
              <p className="mt-1 text-sm text-muted-foreground">
                {notification.message}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {TYPE_LABELS[notification.type]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {notification.link && (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={notification.link} />}
            >
              <ExternalLink className="mr-2 size-3" />
              Open
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleRead(notification)}
          >
            <Check className="mr-2 size-3" />
            {notification.isRead ? "Mark unread" : "Mark read"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(notification)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 size-3" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}