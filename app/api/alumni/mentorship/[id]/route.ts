import { auth } from "@/lib/auth";
import { db } from "@/db";
import { mentorships } from "@/db/schema";
import { eq } from "drizzle-orm";
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  const currentUserId = guard.session.user.id;

  try {
    const body = await req.json();
    const { status } = body;

    if (!["active", "cancelled", "completed"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    /* ---------- Fetch the mentorship ---------- */
    const [existing] = await db
      .select()
      .from(mentorships)
      .where(eq(mentorships.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Mentorship not found" },
        { status: 404 }
      );
    }

    /* ---------- Must be a party ---------- */
    const isMentor = existing.mentorId === currentUserId;
    const isMentee = existing.menteeId === currentUserId;

    if (!isMentor && !isMentee) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    /* ---------- Status transition rules ---------- */
    // active  → only mentor can accept (from pending)
    // cancelled → either party can cancel (from pending or active)
    // completed → only mentor can mark completed (from active)

    if (status === "active") {
      if (!isMentor) {
        return NextResponse.json(
          { success: false, error: "Only mentor can accept" },
          { status: 403 }
        );
      }
      if (existing.status !== "pending") {
        return NextResponse.json(
          { success: false, error: "Can only accept pending requests" },
          { status: 400 }
        );
      }
    }

    if (status === "completed") {
      if (!isMentor) {
        return NextResponse.json(
          { success: false, error: "Only mentor can mark complete" },
          { status: 403 }
        );
      }
      if (existing.status !== "active") {
        return NextResponse.json(
          { success: false, error: "Only active mentorships can be completed" },
          { status: 400 }
        );
      }
    }

    if (status === "cancelled") {
      if (!["pending", "active"].includes(existing.status)) {
        return NextResponse.json(
          { success: false, error: "Cannot cancel at this stage" },
          { status: 400 }
        );
      }
    }

    /* ---------- Build patch ---------- */
    const patch: Record<string, any> = { status };

    if (status === "active") {
      patch.startedAt = new Date();
    } else if (status === "completed" || status === "cancelled") {
      patch.endedAt = new Date();
    }

    const [updated] = await db
      .update(mentorships)
      .set(patch)
      .where(eq(mentorships.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Mentorship ${status}`,
    });
  } catch (error: any) {
    console.error("[ALUMNI_MENTORSHIP_PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}