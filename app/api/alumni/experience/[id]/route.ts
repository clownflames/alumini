import { auth } from "@/lib/auth";
import { db } from "@/db";
import { alumniExperience } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

  try {
    const body = await req.json();
    const {
      companyName,
      jobTitle,
      location,
      startDate,
      endDate,
      currentlyWorking,
      description,
    } = body;

    const patch: Record<string, any> = {};
    if (companyName !== undefined)
      patch.companyName = companyName.trim();
    if (jobTitle !== undefined) patch.jobTitle = jobTitle.trim();
    if (location !== undefined) patch.location = location?.trim() || null;
    if (startDate !== undefined)
      patch.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      patch.endDate = endDate ? new Date(endDate) : null;
    if (currentlyWorking !== undefined)
      patch.currentlyWorking = !!currentlyWorking;
    if (description !== undefined)
      patch.description = description?.trim() || null;

    const [updated] = await db
      .update(alumniExperience)
      .set(patch)
      .where(
        and(
          eq(alumniExperience.id, id),
          eq(alumniExperience.userId, guard.session.user.id)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Experience updated",
    });
  } catch (error: any) {
    console.error("[ALUMNI_EXP_PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(alumniExperience)
      .where(
        and(
          eq(alumniExperience.id, id),
          eq(alumniExperience.userId, guard.session.user.id)
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Experience deleted",
    });
  } catch (error: any) {
    console.error("[ALUMNI_EXP_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}