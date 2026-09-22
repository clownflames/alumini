import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  user as userTable,
  alumniProfiles,
  colleges,
  departments,
  batches,
} from "@/db/schema";
import { desc, eq, and, or, ilike } from "drizzle-orm";
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

/* ---------- GET: list alumni ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const collegeId = searchParams.get("collegeId");
  const verified = searchParams.get("verified");

  try {
    const rows = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        image: userTable.image,
        emailVerified: userTable.emailVerified,
        status: userTable.status,
        createdAt: userTable.createdAt,

        profileId: alumniProfiles.id,
        firstName: alumniProfiles.firstName,
        lastName: alumniProfiles.lastName,
        headline: alumniProfiles.headline,
        bio: alumniProfiles.bio,
        phone: alumniProfiles.phone,
        city: alumniProfiles.city,
        state: alumniProfiles.state,
        country: alumniProfiles.country,
        currentJobTitle: alumniProfiles.currentJobTitle,
        graduationYear: alumniProfiles.graduationYear,
        profileCompleted: alumniProfiles.profileCompleted,
        isVerified: alumniProfiles.isVerified,
        isOpenToWork: alumniProfiles.isOpenToWork,
        isMentor: alumniProfiles.isMentor,

        collegeId: alumniProfiles.collegeId,
        collegeName: colleges.name,
        departmentId: alumniProfiles.departmentId,
        departmentName: departments.name,
        batchId: alumniProfiles.batchId,
        batchYear: batches.year,
      })
      .from(userTable)
      .leftJoin(
        alumniProfiles,
        eq(alumniProfiles.userId, userTable.id)
      )
      .leftJoin(colleges, eq(alumniProfiles.collegeId, colleges.id))
      .leftJoin(
        departments,
        eq(alumniProfiles.departmentId, departments.id)
      )
      .leftJoin(batches, eq(alumniProfiles.batchId, batches.id))
      .where(
        and(
          eq(userTable.role, "alumni"),
          q
            ? or(
                ilike(userTable.name, `%${q}%`),
                ilike(userTable.email, `%${q}%`),
                ilike(alumniProfiles.headline, `%${q}%`),
                ilike(alumniProfiles.currentJobTitle, `%${q}%`)
              )
            : undefined
        )
      )
      .orderBy(desc(userTable.createdAt));

    const filtered = rows.filter((r) => {
      if (collegeId && r.collegeId !== collegeId) return false;
      if (verified === "true" && !r.isVerified) return false;
      if (verified === "false" && r.isVerified) return false;
      return true;
    });

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("[ALUMNI_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch alumni" },
      { status: 500 }
    );
  }
}