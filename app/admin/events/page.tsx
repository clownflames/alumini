import { auth } from "@/lib/auth";
import { db } from "@/db";
import { events, colleges } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EventsClient } from "./events-client";

export default async function EventsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "super_admin") redirect("/dashboard");

  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      coverImage: events.coverImage,
      eventType: events.eventType,
      status: events.status,
      startAt: events.startAt,
      endAt: events.endAt,
      location: events.location,
      meetingUrl: events.meetingUrl,
      maxAttendees: events.maxAttendees,
      createdAt: events.createdAt,
      collegeId: events.collegeId,
      collegeName: colleges.name,
      createdBy: events.createdBy,
    })
    .from(events)
    .leftJoin(colleges, eq(events.collegeId, colleges.id))
    .orderBy(desc(events.startAt));

  const collegeList = await db
    .select({ id: colleges.id, name: colleges.name })
    .from(colleges)
    .orderBy(colleges.name);

  const serialized = rows.map((r) => ({
    ...r,
    startAt: r.startAt.toISOString(),
    endAt: r.endAt ? r.endAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <EventsClient initialEvents={serialized} colleges={collegeList} />
  );
}