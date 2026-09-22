import { auth } from "@/lib/auth";
import { db } from "@/db";
import { alumniProfiles } from "@/db/schema";
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

export async function PATCH(req: NextRequest) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const userId = guard.session.user.id;

  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      headline,
      bio,
      phone,
      dateOfBirth,
      gender,
      city,
      state,
      country,
      postalCode,
      currentJobTitle,
      graduationYear,
      collegeId,
      departmentId,
      batchId,
      isOpenToWork,
      isMentor,
      allowMessages,
    } = body;

    const patch: Record<string, any> = {};
    if (firstName !== undefined)
      patch.firstName = firstName?.trim() || null;
    if (lastName !== undefined) patch.lastName = lastName?.trim() || null;
    if (headline !== undefined) patch.headline = headline?.trim() || null;
    if (bio !== undefined) patch.bio = bio?.trim() || null;
    if (phone !== undefined) patch.phone = phone?.trim() || null;
    if (dateOfBirth !== undefined)
      patch.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (gender !== undefined) patch.gender = gender?.trim() || null;
    if (city !== undefined) patch.city = city?.trim() || null;
    if (state !== undefined) patch.state = state?.trim() || null;
    if (country !== undefined) patch.country = country?.trim() || null;
    if (postalCode !== undefined)
      patch.postalCode = postalCode?.trim() || null;
    if (currentJobTitle !== undefined)
      patch.currentJobTitle = currentJobTitle?.trim() || null;
    if (graduationYear !== undefined)
      patch.graduationYear =
        graduationYear === "" || graduationYear === null
          ? null
          : Number(graduationYear);
    if (collegeId !== undefined) patch.collegeId = collegeId || null;
    if (departmentId !== undefined)
      patch.departmentId = departmentId || null;
    if (batchId !== undefined) patch.batchId = batchId || null;
    if (isOpenToWork !== undefined)
      patch.isOpenToWork = !!isOpenToWork;
    if (isMentor !== undefined) patch.isMentor = !!isMentor;
    if (allowMessages !== undefined)
      patch.allowMessages = !!allowMessages;

    // Check profile completion
    const [existing] = await db
      .select()
      .from(alumniProfiles)
      .where(eq(alumniProfiles.userId, userId))
      .limit(1);

    // If profile exists, update; else insert
    if (existing) {
      // Compute profileCompleted
      const merged = { ...existing, ...patch };
      const fields = [
        merged.firstName,
        merged.lastName,
        merged.headline,
        merged.bio,
        merged.phone,
        merged.city,
        merged.collegeId,
        merged.departmentId,
        merged.batchId,
        merged.currentJobTitle,
      ];
      const filled = fields.filter(Boolean).length;
      patch.profileCompleted = filled === fields.length;

      const [updated] = await db
        .update(alumniProfiles)
        .set(patch)
        .where(eq(alumniProfiles.userId, userId))
        .returning();

      return NextResponse.json({
        success: true,
        data: updated,
        message: "Profile updated",
      });
    } else {
      // Create new profile
      const [created] = await db
        .insert(alumniProfiles)
        .values({
          id: crypto.randomUUID(),
          userId,
          ...patch,
        })
        .returning();

      return NextResponse.json({
        success: true,
        data: created,
        message: "Profile created",
      });
    }
  } catch (error: any) {
    console.error("[ALUMNI_PROFILE_PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}