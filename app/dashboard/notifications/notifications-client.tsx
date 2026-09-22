"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationList } from "./notification-list";
import type { Notification } from "./notification-types";

export function NotificationsClient({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered =
    tab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  /* ---------- Toggle read (optimistic) ---------- */
  const handleToggleRead = async (n: Notification) => {
    const newValue = !n.isRead;

    setNotifications((prev) =>
      prev.map((x) => (x.id === n.id ? { ...x, isRead: newValue } : x))
    );

    try {
      const res = await fetch(`/api/alumni/notifications/${n.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: newValue }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
    } catch (err: any) {
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: n.isRead } : x))
      );
      toast.error(err.message || "Update failed");
    }
  };

  /* ---------- Delete (optimistic) ---------- */
  const handleDelete = async (n: Notification) => {
    const snapshot = notifications;
    setNotifications((prev) => prev.filter((x) => x.id !== n.id));

    try {
      const res = await fetch(`/api/alumni/notifications/${n.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      toast.success("Notification deleted");
    } catch (err: any) {
      setNotifications(snapshot);
      toast.error(err.message || "Delete failed");
    }
  };

  /* ---------- Mark all read ---------- */
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    const snapshot = notifications;

    setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));

    try {
      const res = await fetch("/api/alumni/notifications/mark-all", {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      toast.success("All notifications marked as read");
    } catch (err: any) {
      setNotifications(snapshot);
      toast.error(err.message || "Update failed");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Stay updated with connections, events and job activity.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleMarkAllRead}
          disabled={markingAll || unreadCount === 0}
        >
          {markingAll ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <CheckCheck className="mr-2 size-4" />
          )}
          Mark all read
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            All
            {notifications.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {notifications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List */}
      <NotificationList
        notifications={filtered}
        onToggleRead={handleToggleRead}
        onDelete={handleDelete}
      />
    </div>
  );
}