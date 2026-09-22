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
    const { allowMessages, isOpenToWork, isMentor } = body;

    const patch: Record<string, any> = {};
    if (allowMessages !== undefined) patch.allowMessages = !!allowMessages;
    if (isOpenToWork !== undefined) patch.isOpenToWork = !!isOpenToWork;
    if (isMentor !== undefined) patch.isMentor = !!isMentor;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { success: false, error: "Nothing to update" },
        { status: 400 }
      );
    }

    // Check if profile exists
    const [existing] = await db
      .select({ id: alumniProfiles.id })
      .from(alumniProfiles)
      .where(eq(alumniProfiles.userId, userId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(alumniProfiles)
        .set(patch)
        .where(eq(alumniProfiles.userId, userId))
        .returning();

      return NextResponse.json({
        success: true,
        data: updated,
        message: "Privacy updated",
      });
    } else {
      // Create profile with just these flags
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
        message: "Privacy updated",
      });
    }
  } catch (error: any) {
    console.error("[ALUMNI_PRIVACY_PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}