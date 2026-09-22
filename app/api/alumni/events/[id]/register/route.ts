import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  events,
  eventRegistrations,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
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

/* ---------- POST: toggle registration ---------- */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  const userId = guard.session.user.id;

  try {
    /* ---------- Validate event ---------- */
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.status !== "published") {
      return NextResponse.json(
        { success: false, error: "Event is not open for registration" },
        { status: 400 }
      );
    }

    if (new Date(event.startAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Event has already started" },
        { status: 400 }
      );
    }

    /* ---------- Check existing registration ---------- */
    const [existing] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, id),
          eq(eventRegistrations.userId, userId)
        )
      )
      .limit(1);

    if (existing) {
      // Unregister
      await db
        .delete(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, id),
            eq(eventRegistrations.userId, userId)
          )
        );

      return NextResponse.json({
        success: true,
        registered: false,
        message: "Registration cancelled",
      });
    }

    /* ---------- Capacity check ---------- */
    if (event.maxAttendees !== null) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, id));

      if (count >= event.maxAttendees) {
        return NextResponse.json(
          { success: false, error: "Event is full" },
          { status: 400 }
        );
      }
    }

    /* ---------- Register ---------- */
    await db.insert(eventRegistrations).values({
      eventId: id,
      userId,
    });

    return NextResponse.json({
      success: true,
      registered: true,
      message: "Successfully registered",
    });
  } catch (error: any) {
    console.error("[ALUMNI_EVENT_REGISTER]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed" },
      { status: 500 }
    );
  }
}