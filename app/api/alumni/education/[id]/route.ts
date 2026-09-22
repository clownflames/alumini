import { auth } from "@/lib/auth";
import { db } from "@/db";
import { alumniEducation } from "@/db/schema";
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
      collegeName,
      degree,
      fieldOfStudy,
      startYear,
      endYear,
      description,
    } = body;

    const patch: Record<string, any> = {};
    if (collegeName !== undefined)
      patch.collegeName = collegeName.trim();
    if (degree !== undefined) patch.degree = degree?.trim() || null;
    if (fieldOfStudy !== undefined)
      patch.fieldOfStudy = fieldOfStudy?.trim() || null;
    if (startYear !== undefined)
      patch.startYear =
        startYear === "" || startYear === null ? null : Number(startYear);
    if (endYear !== undefined)
      patch.endYear =
        endYear === "" || endYear === null ? null : Number(endYear);
    if (description !== undefined)
      patch.description = description?.trim() || null;

    const [updated] = await db
      .update(alumniEducation)
      .set(patch)
      .where(
        and(
          eq(alumniEducation.id, id),
          eq(alumniEducation.userId, guard.session.user.id)
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
      message: "Education updated",
    });
  } catch (error: any) {
    console.error("[ALUMNI_EDU_PATCH]", error);
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
      .delete(alumniEducation)
      .where(
        and(
          eq(alumniEducation.id, id),
          eq(alumniEducation.userId, guard.session.user.id)
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
      message: "Education deleted",
    });
  } catch (error: any) {
    console.error("[ALUMNI_EDU_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}