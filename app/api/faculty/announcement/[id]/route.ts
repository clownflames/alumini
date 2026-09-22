import { auth } from "@/lib/auth";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq } from "drizzle-orm";
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

/* ---------- PATCH: only creator can edit ---------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireFaculty();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  try {
    // Check ownership
    const [existing] = await db
      .select({ createdBy: announcements.createdBy })
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Announcement not found" },
        { status: 404 }
      );
    }

    if (existing.createdBy !== guard.session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own announcements" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      content,
      priority,
      audience,
      isPinned,
      isPublished,
      expiresAt,
      collegeId,
    } = body;

    const patch: Record<string, any> = {};
    if (title !== undefined) patch.title = title.trim();
    if (content !== undefined) patch.content = content.trim();
    if (priority !== undefined) patch.priority = priority;
    if (audience !== undefined) patch.audience = audience;
    if (isPinned !== undefined) patch.isPinned = !!isPinned;
    if (expiresAt !== undefined)
      patch.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (collegeId !== undefined) patch.collegeId = collegeId || null;

    // Handle publish transition
    if (isPublished !== undefined) {
      const published = !!isPublished;
      patch.isPublished = published;

      const [current] = await db
        .select({ isPublished: announcements.isPublished })
        .from(announcements)
        .where(eq(announcements.id, id))
        .limit(1);

      if (published && !current?.isPublished) {
        patch.publishedAt = new Date();
      }
    }

    const [updated] = await db
      .update(announcements)
      .set(patch)
      .where(eq(announcements.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Announcement updated",
    });
  } catch (error: any) {
    console.error("[FACULTY_ANNOUNCEMENT_PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}