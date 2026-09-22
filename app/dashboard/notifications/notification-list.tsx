"use client";

import { Bell } from "lucide-react";
import { NotificationItem } from "./notification-item";
import type { Notification } from "./notification-types";

export function NotificationList({
  notifications,
  onToggleRead,
  onDelete,
}: {
  notifications: Notification[];
  onToggleRead: (n: Notification) => void;
  onDelete: (n: Notification) => void;
}) {
  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-12 text-center">
        <Bell className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No notifications here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onToggleRead={onToggleRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}