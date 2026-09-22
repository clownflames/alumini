import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  mentorships,
  user as userTable,
  alumniProfiles,
} from "@/db/schema";
import { desc, eq, aliasedTable } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

async function requireFaculty() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "admin") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

/* ---------- GET: list mentorships ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireFaculty();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    // Use aliases for the two user joins
    const mentorUser = aliasedTable(userTable, "mentor_user");
    const menteeUser = aliasedTable(userTable, "mentee_user");
    const mentorProfile = aliasedTable(
      alumniProfiles,
      "mentor_profile"
    );

    const rows = await db
      .select({
        id: mentorships.id,
        focus: mentorships.focus,
        status: mentorships.status,
        requestMessage: mentorships.requestMessage,
        goal: mentorships.goal,
        startedAt: mentorships.startedAt,
        endedAt: mentorships.endedAt,
        createdAt: mentorships.createdAt,
        updatedAt: mentorships.updatedAt,

        mentorId: mentorships.mentorId,
        mentorName: mentorUser.name,
        mentorEmail: mentorUser.email,
        mentorImage: mentorUser.image,
        mentorHeadline: mentorProfile.headline,
        mentorJobTitle: mentorProfile.currentJobTitle,

        menteeId: mentorships.menteeId,
        menteeName: menteeUser.name,
        menteeEmail: menteeUser.email,
        menteeImage: menteeUser.image,
      })
      .from(mentorships)
      .leftJoin(mentorUser, eq(mentorships.mentorId, mentorUser.id))
      .leftJoin(menteeUser, eq(mentorships.menteeId, menteeUser.id))
      .leftJoin(
        mentorProfile,
        eq(mentorProfile.userId, mentorships.mentorId)
      )
      .orderBy(desc(mentorships.createdAt));

    const filtered = status
      ? rows.filter((r) => r.status === status)
      : rows;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("[FACULTY_MENTORSHIPS_GET]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch mentorships",
      },
      { status: 500 }
    );
  }
}