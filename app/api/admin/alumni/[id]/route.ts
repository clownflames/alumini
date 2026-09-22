import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user as userTable, alumniProfiles } from "@/db/schema";
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

/* ---------- PATCH: update user + profile ---------- */
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
      // user fields
      name,
      status,
      // profile fields
      firstName,
      lastName,
      headline,
      bio,
      phone,
      city,
      state,
      country,
      currentJobTitle,
      graduationYear,
      collegeId,
      departmentId,
      batchId,
      isVerified,
      isOpenToWork,
      isMentor,
    } = body;

    /* ---------- Update user table ---------- */
    const userPatch: Record<string, any> = {};
    if (name !== undefined) userPatch.name = name.trim();
    if (status !== undefined) userPatch.status = status;

    if (Object.keys(userPatch).length > 0) {
      const [updatedUser] = await db
        .update(userTable)
        .set(userPatch)
        .where(eq(userTable.id, id))
        .returning();

      if (!updatedUser) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }
    }

    /* ---------- Update / insert profile ---------- */
    const profilePatch: Record<string, any> = {};
    if (firstName !== undefined) profilePatch.firstName = firstName?.trim() || null;
    if (lastName !== undefined) profilePatch.lastName = lastName?.trim() || null;
    if (headline !== undefined) profilePatch.headline = headline?.trim() || null;
    if (bio !== undefined) profilePatch.bio = bio?.trim() || null;
    if (phone !== undefined) profilePatch.phone = phone?.trim() || null;
    if (city !== undefined) profilePatch.city = city?.trim() || null;
    if (state !== undefined) profilePatch.state = state?.trim() || null;
    if (country !== undefined) profilePatch.country = country?.trim() || null;
    if (currentJobTitle !== undefined)
      profilePatch.currentJobTitle = currentJobTitle?.trim() || null;
    if (graduationYear !== undefined)
      profilePatch.graduationYear =
        graduationYear === "" || graduationYear === null
          ? null
          : Number(graduationYear);
    if (collegeId !== undefined) profilePatch.collegeId = collegeId || null;
    if (departmentId !== undefined)
      profilePatch.departmentId = departmentId || null;
    if (batchId !== undefined) profilePatch.batchId = batchId || null;
    if (isVerified !== undefined) profilePatch.isVerified = !!isVerified;
    if (isOpenToWork !== undefined)
      profilePatch.isOpenToWork = !!isOpenToWork;
    if (isMentor !== undefined) profilePatch.isMentor = !!isMentor;

    if (Object.keys(profilePatch).length > 0) {
      // Check if profile exists
      const [existing] = await db
        .select({ id: alumniProfiles.id })
        .from(alumniProfiles)
        .where(eq(alumniProfiles.userId, id))
        .limit(1);

      if (existing) {
        await db
          .update(alumniProfiles)
          .set(profilePatch)
          .where(eq(alumniProfiles.userId, id));
      } else {
        await db.insert(alumniProfiles).values({
          id: crypto.randomUUID(),
          userId: id,
          ...profilePatch,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Alumni updated",
    });
  } catch (error: any) {
    console.error("[ALUMNI_PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}

/* ---------- DELETE: remove user (cascades to profile) ---------- */
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
      .delete(userTable)
      .where(eq(userTable.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Alumni deleted",
    });
  } catch (error: any) {
    console.error("[ALUMNI_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}