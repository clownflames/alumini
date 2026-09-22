import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  events,
  colleges,
  eventRegistrations,
} from "@/db/schema";
import { and, asc, eq, gte, inArray, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

async function requireAlumni() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "alumni") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

export async function GET(req: NextRequest) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const currentUserId = guard.session.user.id;
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || "upcoming"; // upcoming | past | all
  const eventType = searchParams.get("eventType"); // in_person | online | hybrid
  const q = searchParams.get("q")?.trim();

  try {
    const now = new Date();

    /* ---------- Build where condition ---------- */
    const conditions: any[] = [
      // Only published (and completed for past) events visible to alumni
      or(
        eq(events.status, "published"),
        eq(events.status, "completed"),
        eq(events.status, "cancelled")
      )!,
    ];

    if (scope === "upcoming") {
      conditions.push(gte(events.startAt, now));
      conditions.push(eq(events.status, "published"));
    } else if (scope === "past") {
      conditions.push(sql`${events.startAt} < ${now}`);
    }

    if (eventType) {
      conditions.push(eq(events.eventType, eventType as any));
    }

    if (q) {
      conditions.push(
        or(
          sql`${events.title} ILIKE ${`%${q}%`}`,
          sql`${events.location} ILIKE ${`%${q}%`}`
        )!
      );
    }

    /* ---------- Fetch events ---------- */
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
        collegeName: colleges.name,
        createdAt: events.createdAt,
      })
      .from(events)
      .leftJoin(colleges, eq(events.collegeId, colleges.id))
      .where(and(...conditions))
      .orderBy(
        scope === "past" ? sql`${events.startAt} DESC` : asc(events.startAt)
      )
      .limit(100);

    const eventIds = rows.map((r) => r.id);

    /* ---------- Registration counts + my registrations ---------- */
    let regCountMap: Record<string, number> = {};
    let myRegs = new Set<string>();

    if (eventIds.length > 0) {
      const counts = await db
        .select({
          eventId: eventRegistrations.eventId,
          count: sql<number>`count(*)::int`,
        })
        .from(eventRegistrations)
        .where(inArray(eventRegistrations.eventId, eventIds))
        .groupBy(eventRegistrations.eventId);

      for (const r of counts) {
        regCountMap[r.eventId] = r.count;
      }

      const myRows = await db
        .select({ eventId: eventRegistrations.eventId })
        .from(eventRegistrations)
        .where(
          and(
            inArray(eventRegistrations.eventId, eventIds),
            eq(eventRegistrations.userId, currentUserId)
          )
        );

      myRegs = new Set(myRows.map((r) => r.eventId));
    }

    /* ---------- Build response ---------- */
    const data = rows.map((r) => {
      const regCount = regCountMap[r.id] || 0;
      const isFull =
        r.maxAttendees !== null && regCount >= r.maxAttendees;

      return {
        id: r.id,
        title: r.title,
        description: r.description,
        coverImage: r.coverImage,
        eventType: r.eventType,
        status: r.status,
        startAt: r.startAt.toISOString(),
        endAt: r.endAt ? r.endAt.toISOString() : null,
        location: r.location,
        meetingUrl: r.meetingUrl,
        maxAttendees: r.maxAttendees,
        collegeName: r.collegeName,
        createdAt: r.createdAt.toISOString(),
        registrationCount: regCount,
        isRegistered: myRegs.has(r.id),
        isFull,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[ALUMNI_EVENTS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}