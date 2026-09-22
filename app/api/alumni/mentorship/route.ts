import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  mentorships,
  user as userTable,
  alumniProfiles,
} from "@/db/schema";
import { desc, eq, or, aliasedTable } from "drizzle-orm";
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

  try {
    const mentorUser = aliasedTable(userTable, "mentor_user");
    const menteeUser = aliasedTable(userTable, "mentee_user");
    const mentorProfile = aliasedTable(
      alumniProfiles,
      "mentor_profile"
    );

    const rows = await db
      .select({
        id: mentorships.id,
        status: mentorships.status,
        focus: mentorships.focus,
        requestMessage: mentorships.requestMessage,
        goal: mentorships.goal,
        startedAt: mentorships.startedAt,
        endedAt: mentorships.endedAt,
        createdAt: mentorships.createdAt,
        updatedAt: mentorships.updatedAt,

        mentorId: mentorships.mentorId,
        mentorName: mentorUser.name,
        mentorImage: mentorUser.image,
        mentorHeadline: mentorProfile.headline,
        mentorJobTitle: mentorProfile.currentJobTitle,

        menteeId: mentorships.menteeId,
        menteeName: menteeUser.name,
        menteeImage: menteeUser.image,
      })
      .from(mentorships)
      .leftJoin(mentorUser, eq(mentorships.mentorId, mentorUser.id))
      .leftJoin(menteeUser, eq(mentorships.menteeId, menteeUser.id))
      .leftJoin(
        mentorProfile,
        eq(mentorProfile.userId, mentorships.mentorId)
      )
      .where(
        or(
          eq(mentorships.mentorId, currentUserId),
          eq(mentorships.menteeId, currentUserId)
        )
      )
      .orderBy(desc(mentorships.createdAt));

    const data = rows.map((r) => ({
      id: r.id,
      status: r.status,
      focus: r.focus,
      requestMessage: r.requestMessage,
      goal: r.goal,
      startedAt: r.startedAt ? r.startedAt.toISOString() : null,
      endedAt: r.endedAt ? r.endedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),

      mentorId: r.mentorId,
      mentorName: r.mentorName || "Unknown",
      mentorImage: r.mentorImage,
      mentorHeadline: r.mentorHeadline,
      mentorJobTitle: r.mentorJobTitle,

      menteeId: r.menteeId,
      menteeName: r.menteeName || "Unknown",
      menteeImage: r.menteeImage,

      role:
        r.mentorId === currentUserId
          ? ("mentor" as const)
          : ("mentee" as const),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[ALUMNI_MENTORSHIP_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}