import { auth } from "@/lib/auth";
import { db } from "@/db";
import { events, colleges } from "@/db/schema";
import { desc, eq, ilike, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

async function requireSuperAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "super_admin") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

/* ---------- GET: list events ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const collegeId = searchParams.get("collegeId");

  try {
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
      .where(
        q
          ? or(
              ilike(events.title, `%${q}%`),
              ilike(events.location, `%${q}%`)
            )
          : undefined
      )
      .orderBy(desc(events.startAt));

    const filtered = collegeId
      ? rows.filter((r) => r.collegeId === collegeId)
      : rows;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("[EVENTS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/* ---------- POST: create event ---------- */
export async function POST(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      coverImage,
      eventType,
      status,
      startAt,
      endAt,
      location,
      meetingUrl,
      maxAttendees,
      collegeId,
    } = body;

    if (!title?.trim() || !startAt) {
      return NextResponse.json(
        { success: false, error: "Title and start date are required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(events)
      .values({
        id,
        createdBy: guard.session.user.id,
        collegeId: collegeId || null,
        title: title.trim(),
        description: description?.trim() || null,
        coverImage: coverImage?.trim() || null,
        eventType: eventType || "in_person",
        status: status || "draft",
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        location: location?.trim() || null,
        meetingUrl: meetingUrl?.trim() || null,
        maxAttendees:
          maxAttendees !== undefined && maxAttendees !== null && maxAttendees !== ""
            ? Number(maxAttendees)
            : null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Event created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[EVENTS_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}