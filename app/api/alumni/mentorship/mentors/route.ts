import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  user as userTable,
  alumniProfiles,
  colleges,
  departments,
  mentorships,
} from "@/db/schema";
import {
  and,
  desc,
  eq,
  ilike,
  ne,
  or,
  inArray,
} from "drizzle-orm";
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
  const q = searchParams.get("q")?.trim();
  const collegeId = searchParams.get("collegeId");
  const departmentId = searchParams.get("departmentId");

  try {
    const conditions: any[] = [
      eq(userTable.role, "alumni"),
      eq(alumniProfiles.isMentor, true),
      ne(userTable.id, currentUserId),
    ];

    if (q) {
      conditions.push(
        or(
          ilike(userTable.name, `%${q}%`),
          ilike(alumniProfiles.headline, `%${q}%`),
          ilike(alumniProfiles.currentJobTitle, `%${q}%`)
        )!
      );
    }

    if (collegeId) {
      conditions.push(eq(alumniProfiles.collegeId, collegeId));
    }
    if (departmentId) {
      conditions.push(eq(alumniProfiles.departmentId, departmentId));
    }

    const rows = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        image: userTable.image,
        headline: alumniProfiles.headline,
        jobTitle: alumniProfiles.currentJobTitle,
        city: alumniProfiles.city,
        collegeName: colleges.name,
        departmentName: departments.name,
      })
      .from(userTable)
      .innerJoin(
        alumniProfiles,
        eq(alumniProfiles.userId, userTable.id)
      )
      .leftJoin(colleges, eq(alumniProfiles.collegeId, colleges.id))
      .leftJoin(
        departments,
        eq(alumniProfiles.departmentId, departments.id)
      )
      .where(and(...conditions))
      .orderBy(desc(alumniProfiles.isVerified))
      .limit(100);

    const mentorIds = rows.map((r) => r.id);

    /* ---------- Fetch existing mentorships ---------- */
    let existingMap: Record<
      string,
      { id: string; status: string; direction: "sent" | "received" }
    > = {};

    if (mentorIds.length > 0) {
      const existing = await db
        .select({
          id: mentorships.id,
          mentorId: mentorships.mentorId,
          menteeId: mentorships.menteeId,
          status: mentorships.status,
        })
        .from(mentorships)
        .where(
          or(
            and(
              eq(mentorships.menteeId, currentUserId),
              inArray(mentorships.mentorId, mentorIds)
            ),
            and(
              eq(mentorships.mentorId, currentUserId),
              inArray(mentorships.menteeId, mentorIds)
            )
          )
        );

      for (const m of existing) {
        const otherId =
          m.mentorId === currentUserId ? m.menteeId : m.mentorId;
        existingMap[otherId] = {
          id: m.id,
          status: m.status,
          direction:
            m.menteeId === currentUserId ? "sent" : "received",
        };
      }
    }

    const data = rows.map((r) => ({
      ...r,
      existingMentorshipId: existingMap[r.id]?.id || null,
      existingMentorshipStatus: existingMap[r.id]?.status || null,
      existingMentorshipDirection: existingMap[r.id]?.direction || null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[ALUMNI_MENTORS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}