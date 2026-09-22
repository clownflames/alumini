import { auth } from "@/lib/auth";
import { db } from "@/db";
import { mentorships } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
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

export async function POST(req: NextRequest) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const currentUserId = guard.session.user.id;

  try {
    const body = await req.json();
    const { mentorId, focus, requestMessage, goal } = body;

    if (!mentorId) {
      return NextResponse.json(
        { success: false, error: "mentorId is required" },
        { status: 400 }
      );
    }

    if (mentorId === currentUserId) {
      return NextResponse.json(
        { success: false, error: "Cannot mentor yourself" },
        { status: 400 }
      );
    }

    /* ---------- Check existing ---------- */
    const [existing] = await db
      .select()
      .from(mentorships)
      .where(
        or(
          and(
            eq(mentorships.mentorId, mentorId),
            eq(mentorships.menteeId, currentUserId)
          ),
          and(
            eq(mentorships.mentorId, currentUserId),
            eq(mentorships.menteeId, mentorId)
          )
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error:
            existing.status === "pending"
              ? "A request already exists"
              : "You already have a mentorship with this person",
        },
        { status: 409 }
      );
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(mentorships)
      .values({
        id,
        mentorId,
        menteeId: currentUserId,
        focus: focus || "general",
        status: "pending",
        requestMessage: requestMessage?.trim() || null,
        goal: goal?.trim() || null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Request sent" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ALUMNI_MENTORSHIP_REQUEST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send" },
      { status: 500 }
    );
  }
}