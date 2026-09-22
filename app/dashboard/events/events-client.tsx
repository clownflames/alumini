"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventCard } from "./event-card";
import { EventViewDrawer } from "./event-view-drawer";
import type { Event, EventType } from "./event-types";

type Scope = "upcoming" | "past" | "all";

export function EventsClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [scope, setScope] = useState<Scope>("upcoming");
  const [eventType, setEventType] = useState<"all" | EventType>("all");
  const [query, setQuery] = useState("");

  const [viewTarget, setViewTarget] = useState<Event | null>(null);

  /* ---------- Fetch ---------- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("scope", scope);
      if (eventType !== "all") params.set("eventType", eventType);
      if (query) params.set("q", query);

      const res = await fetch(`/api/alumni/events?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setEvents(json.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [scope, eventType, query]);

  // Debounced fetch
  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  /* ---------- Register toggle ---------- */
  const handleRegister = async (event: Event) => {
    setBusyId(event.id);

    const wasRegistered = event.isRegistered;

    // Optimistic
    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id
          ? {
              ...e,
              isRegistered: !wasRegistered,
              registrationCount:
                e.registrationCount + (wasRegistered ? -1 : 1),
              isFull:
                e.maxAttendees !== null &&
                e.registrationCount + (wasRegistered ? -1 : 1) >=
                  e.maxAttendees,
            }
          : e
      )
    );

    try {
      const res = await fetch(
        `/api/alumni/events/${event.id}/register`,
        { method: "POST" }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      toast.success(
        json.registered ? "Registered successfully" : "Registration cancelled"
      );

      // Update view target if open
      if (viewTarget?.id === event.id) {
        setViewTarget((prev) =>
          prev
            ? {
                ...prev,
                isRegistered: json.registered,
                registrationCount:
                  prev.registrationCount + (json.registered ? 1 : -1),
              }
            : prev
        );
      }
    } catch (err: any) {
      // Revert
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? {
                ...e,
                isRegistered: wasRegistered,
                registrationCount: event.registrationCount,
                isFull: event.isFull,
              }
            : e
        )
      );
      toast.error(err.message || "Failed");
    } finally {
      setBusyId(null);
    }
  };

  const hasFilters = eventType !== "all" || query;

  const clearFilters = () => {
    setEventType("all");
    setQuery("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Events</h1>
        <p className="text-sm text-muted-foreground">
          Discover and register for alumni events.
        </p>
      </div>

      {/* Scope tabs */}
      <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={eventType}
          onValueChange={(v) => setEventType(v as "all" | EventType)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="in_person">In Person</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {events.length} {events.length === 1 ? "event" : "events"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-12 text-center">
          <Calendar className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {scope === "upcoming"
              ? "No upcoming events right now."
              : scope === "past"
                ? "No past events found."
                : "No events found."}
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              onView={setViewTarget}
              onRegister={handleRegister}
              busy={busyId === e.id}
            />
          ))}
        </div>
      )}

      {/* View drawer */}
      <EventViewDrawer
        open={!!viewTarget}
        onOpenChange={(v) => !v && setViewTarget(null)}
        event={viewTarget}
        onRegister={handleRegister}
        busy={busyId === viewTarget?.id}
      />
    </div>
  );
}