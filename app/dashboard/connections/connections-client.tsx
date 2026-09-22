"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ConnectionCard } from "./connection-card";
import type { Connection } from "./connection-types";

type Tab =
  | "all"
  | "accepted"
  | "received_pending"
  | "sent_pending";

export function ConnectionsClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [removeTarget, setRemoveTarget] = useState<Connection | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Connection | null>(null);

  /* ---------- Fetch ---------- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alumni/connections");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setConnections(json.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load connections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------- Counts ---------- */
  const counts = {
    all: connections.length,
    accepted: connections.filter((c) => c.status === "accepted").length,
    received_pending: connections.filter(
      (c) => c.status === "pending" && c.direction === "received"
    ).length,
    sent_pending: connections.filter(
      (c) => c.status === "pending" && c.direction === "sent"
    ).length,
  };

  /* ---------- Filtered ---------- */
  const filtered = connections.filter((c) => {
    if (tab === "accepted" && c.status !== "accepted") return false;
    if (
      tab === "received_pending" &&
      !(c.status === "pending" && c.direction === "received")
    )
      return false;
    if (
      tab === "sent_pending" &&
      !(c.status === "pending" && c.direction === "sent")
    )
      return false;

    if (query) {
      const q = query.toLowerCase();
      return (
        c.otherName.toLowerCase().includes(q) ||
        (c.otherHeadline || "").toLowerCase().includes(q) ||
        (c.otherJobTitle || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  /* ---------- Accept ---------- */
  const handleAccept = async (c: Connection) => {
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/alumni/connections/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setConnections((prev) =>
        prev.map((x) =>
          x.id === c.id ? { ...x, status: "accepted" } : x
        )
      );
      toast.success(`You are now connected with ${c.otherName}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to accept");
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- Reject ---------- */
  const handleReject = async (c: Connection) => {
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/alumni/connections/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setConnections((prev) => prev.filter((x) => x.id !== c.id));
      toast.success("Request rejected");
      setRejectTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to reject");
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- Remove ---------- */
  const handleRemove = async () => {
    if (!removeTarget) return;
    setBusyId(removeTarget.id);
    try {
      const res = await fetch(
        `/api/alumni/connections/${removeTarget.id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setConnections((prev) =>
        prev.filter((x) => x.id !== removeTarget.id)
      );
      toast.success(
        removeTarget.status === "pending"
          ? "Request cancelled"
          : "Connection removed"
      );
      setRemoveTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove");
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- Message ---------- */
  const handleMessage = () => {
    window.location.href = "/dashboard/messages";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Connections</h1>
        <p className="text-sm text-muted-foreground">
          Manage your alumni network connections.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="all">
            All
            {counts.all > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {counts.all}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Connected
            {counts.accepted > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {counts.accepted}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="received_pending">
            Requests
            {counts.received_pending > 0 && (
              <span className="ml-2 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {counts.received_pending}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent_pending">
            Sent
            {counts.sent_pending > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {counts.sent_pending}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <Input
        placeholder="Search connections by name, headline or job..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />

      {/* Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-12 text-center">
          {tab === "received_pending" ? (
            <UserPlus className="size-10 text-muted-foreground" />
          ) : (
            <Users className="size-10 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {tab === "received_pending"
              ? "No pending requests."
              : tab === "sent_pending"
                ? "No sent requests."
                : tab === "accepted"
                  ? "No connections yet. Browse the directory to connect."
                  : "No connections found."}
          </p>
          {tab === "accepted" && counts.accepted === 0 && (
            <Button
              variant="outline"
              size="sm"
              render={<a href="/dashboard/directory" />}
            >
              Browse Directory
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "person" : "people"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <ConnectionCard
                key={c.id}
                connection={c}
                onAccept={handleAccept}
                onReject={(conn) => setRejectTarget(conn)}
                onRemove={(conn) => setRemoveTarget(conn)}
                onMessage={handleMessage}
                busy={busyId === c.id}
              />
            ))}
          </div>
        </>
      )}

      {/* Reject confirm */}
      <AlertDialog
        open={!!rejectTarget}
        onOpenChange={(v) => !v && setRejectTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Reject {rejectTarget?.otherName}'s request?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will not be notified. You can always connect later from
              the directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId === rejectTarget?.id}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (rejectTarget) handleReject(rejectTarget);
              }}
              disabled={busyId === rejectTarget?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busyId === rejectTarget?.id && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove confirm */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {removeTarget?.status === "pending"
                ? "Cancel this request?"
                : `Remove ${removeTarget?.otherName}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.status === "pending"
                ? "Your connection request will be withdrawn."
                : "You will be disconnected. You can always reconnect later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId === removeTarget?.id}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRemove();
              }}
              disabled={busyId === removeTarget?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busyId === removeTarget?.id && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {removeTarget?.status === "pending"
                ? "Cancel Request"
                : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}