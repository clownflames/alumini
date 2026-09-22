import { auth } from "@/lib/auth";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
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

/* ---------- PATCH ---------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

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

    const patch: Record<string, any> = {};
    if (title !== undefined) patch.title = title.trim();
    if (description !== undefined)
      patch.description = description?.trim() || null;
    if (coverImage !== undefined)
      patch.coverImage = coverImage?.trim() || null;
    if (eventType !== undefined) patch.eventType = eventType;
    if (status !== undefined) patch.status = status;
    if (startAt !== undefined) patch.startAt = new Date(startAt);
    if (endAt !== undefined) patch.endAt = endAt ? new Date(endAt) : null;
    if (location !== undefined) patch.location = location?.trim() || null;
    if (meetingUrl !== undefined)
      patch.meetingUrl = meetingUrl?.trim() || null;
    if (maxAttendees !== undefined)
      patch.maxAttendees =
        maxAttendees === "" || maxAttendees === null
          ? null
          : Number(maxAttendees);
    if (collegeId !== undefined) patch.collegeId = collegeId || null;

    const [updated] = await db
      .update(events)
      .set(patch)
      .where(eq(events.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Event updated",
    });
  } catch (error: any) {
    console.error("[EVENT_PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}

/* ---------- DELETE ---------- */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted",
    });
  } catch (error: any) {
    console.error("[EVENT_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}