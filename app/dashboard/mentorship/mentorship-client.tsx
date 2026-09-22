"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
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
import { MentorshipRequestCard } from "./mentorship-request-card";
import { ActiveMentorshipCard } from "./active-mentorship-card";
import { MentorViewDrawer } from "./mentor-view-drawer";
import {
  RequestDialog,
  type RequestFormValues,
} from "./request-dialog";
import type { AvailableMentor, Mentorship } from "./mentorship-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MentorshipClient({
  currentUserId,
  colleges,
  departments,
}: {
  currentUserId: string;
  colleges: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}) {
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  /* ---------- Mentors discovery ---------- */
  const [mentors, setMentors] = useState<AvailableMentor[]>([]);
  const [mentorsLoading, setMentorsLoading] = useState(true);
  const [mentorQuery, setMentorQuery] = useState("");
  const [mentorCollegeId, setMentorCollegeId] = useState("");
  const [mentorDepartmentId, setMentorDepartmentId] = useState("");

  /* ---------- Drawer / dialog ---------- */
  const [viewMentor, setViewMentor] = useState<AvailableMentor | null>(null);
  const [requestMentor, setRequestMentor] =
    useState<AvailableMentor | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ---------- Fetch my mentorships ---------- */
  const fetchMentorships = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alumni/mentorship");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setMentorships(json.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load mentorships");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- Fetch mentors ---------- */
  const fetchMentors = useCallback(async () => {
    setMentorsLoading(true);
    try {
      const params = new URLSearchParams();
      if (mentorQuery) params.set("q", mentorQuery);
      if (mentorCollegeId) params.set("collegeId", mentorCollegeId);
      if (mentorDepartmentId)
        params.set("departmentId", mentorDepartmentId);

      const res = await fetch(
        `/api/alumni/mentorship/mentors?${params.toString()}`
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setMentors(json.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load mentors");
    } finally {
      setMentorsLoading(false);
    }
  }, [mentorQuery, mentorCollegeId, mentorDepartmentId]);

  useEffect(() => {
    fetchMentorships();
  }, [fetchMentorships]);

  useEffect(() => {
    const t = setTimeout(fetchMentors, 300);
    return () => clearTimeout(t);
  }, [fetchMentors]);

  /* ---------- Counts ---------- */
  const incoming = mentorships.filter(
    (m) => m.role === "mentor" && m.status === "pending"
  );
  const outgoing = mentorships.filter(
    (m) => m.role === "mentee" && m.status === "pending"
  );
  const active = mentorships.filter((m) => m.status === "active");
  const past = mentorships.filter(
    (m) => m.status === "completed" || m.status === "cancelled"
  );

  /* ---------- Accept ---------- */
  const handleAccept = async (m: Mentorship) => {
    setBusyId(m.id);
    try {
      const res = await fetch(`/api/alumni/mentorship/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      await fetchMentorships();
      toast.success("Mentorship accepted");
    } catch (err: any) {
      toast.error(err.message || "Failed to accept");
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- Reject / Cancel ---------- */
  const handleCancel = async (m: Mentorship, message?: string) => {
    setBusyId(m.id);
    try {
      const res = await fetch(`/api/alumni/mentorship/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      await fetchMentorships();
      toast.success(message || "Mentorship cancelled");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel");
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- Complete ---------- */
  const handleComplete = async (m: Mentorship) => {
    setBusyId(m.id);
    try {
      const res = await fetch(`/api/alumni/mentorship/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      await fetchMentorships();
      toast.success("Mentorship marked complete");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete");
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- Message ---------- */
  const handleMessage = () => {
    window.location.href = "/dashboard/messages";
  };

  /* ---------- Send request ---------- */
  const handleSendRequest = async (values: RequestFormValues) => {
    if (!requestMentor) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/alumni/mentorship/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: requestMentor.id,
          focus: values.focus,
          requestMessage: values.requestMessage,
          goal: values.goal,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      toast.success("Mentorship request sent");
      setRequestMentor(null);
      setViewMentor(null);
      await fetchMentorships();
      await fetchMentors();
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Mentorship</h1>
        <p className="text-sm text-muted-foreground">
          Give back or grow with a mentor from your alumni network.
        </p>
      </div>

      <Tabs defaultValue="my" className="w-full">
        <TabsList>
          <TabsTrigger value="my">
            My Mentorships
            {active.length + incoming.length + outgoing.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {active.length + incoming.length + outgoing.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="discover">
            Find Mentors
            {mentors.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {mentors.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ---------- My Mentorships Tab ---------- */}
        <TabsContent value="my" className="mt-4 space-y-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : mentorships.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-12 text-center">
              <GraduationCap className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No mentorships yet. Find a mentor to get started.
              </p>
            </div>
          ) : (
            <>
              {/* Incoming requests */}
              {incoming.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-sm font-medium">
                    Incoming Requests ({incoming.length})
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {incoming.map((m) => (
                      <MentorshipRequestCard
                        key={m.id}
                        mentorship={m}
                        onAccept={handleAccept}
                        onReject={(x) => handleCancel(x, "Request declined")}
                        onCancel={handleCancel}
                        busy={busyId === m.id}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Active */}
              {active.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-sm font-medium">
                    Active ({active.length})
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {active.map((m) => (
                      <ActiveMentorshipCard
                        key={m.id}
                        mentorship={m}
                        onComplete={handleComplete}
                        onCancel={handleCancel}
                        onMessage={handleMessage}
                        busy={busyId === m.id}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Outgoing pending */}
              {outgoing.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-sm font-medium">
                    Sent Requests ({outgoing.length})
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {outgoing.map((m) => (
                      <MentorshipRequestCard
                        key={m.id}
                        mentorship={m}
                        onAccept={handleAccept}
                        onReject={handleCancel}
                        onCancel={(x) =>
                          handleCancel(x, "Request cancelled")
                        }
                        busy={busyId === m.id}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Past */}
              {past.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-sm font-medium">
                    Past ({past.length})
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {past.map((m) => (
                      <ActiveMentorshipCard
                        key={m.id}
                        mentorship={m}
                        onComplete={handleComplete}
                        onCancel={handleCancel}
                        onMessage={handleMessage}
                        busy={busyId === m.id}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </TabsContent>

        {/* ---------- Discover Tab ---------- */}
        <TabsContent value="discover" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="space-y-3 rounded-md border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, headline or job title..."
                value={mentorQuery}
                onChange={(e) => setMentorQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                value={mentorCollegeId || "all"}
                onValueChange={(v) =>
                  setMentorCollegeId(v === "all" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Colleges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={mentorDepartmentId || "all"}
                onValueChange={(v) =>
                  setMentorDepartmentId(v === "all" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mentors grid */}
          {mentorsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : mentors.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-12 text-center">
              <Users className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No mentors found matching your filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor) => (
                <button
                  key={mentor.id}
                  onClick={() => setViewMentor(mentor)}
                  className="flex items-start gap-3 rounded-md border p-4 text-left transition-colors hover:bg-accent/50"
                >
                  <Avatar className="size-12 shrink-0">
                    <AvatarImage src={mentor.image || undefined} />
                    <AvatarFallback>{initials(mentor.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium">{mentor.name}</h3>
                    {mentor.headline && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {mentor.headline}
                      </p>
                    )}
                    {mentor.jobTitle && (
                      <p className="mt-1 line-clamp-1 text-xs">
                        {mentor.jobTitle}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {mentor.existingMentorshipStatus === "active" && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                      {mentor.existingMentorshipStatus === "pending" && (
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mentor drawer */}
      <MentorViewDrawer
        open={!!viewMentor}
        onOpenChange={(v) => !v && setViewMentor(null)}
        mentor={viewMentor}
        onRequest={(m) => setRequestMentor(m)}
      />

      {/* Request dialog */}
      <RequestDialog
        open={!!requestMentor}
        onOpenChange={(v) => !v && setRequestMentor(null)}
        mentorName={requestMentor?.name || ""}
        submitting={submitting}
        onSubmit={handleSendRequest}
      />
    </div>
  );
}