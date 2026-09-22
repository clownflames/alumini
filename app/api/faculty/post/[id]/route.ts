import { auth } from "@/lib/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
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
      .select({ userId: posts.userId })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== guard.session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own posts" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { content, image, visibility } = body;

    const patch: Record<string, any> = {};
    if (content !== undefined) patch.content = content.trim();
    if (image !== undefined) patch.image = image?.trim() || null;
    if (visibility !== undefined) patch.visibility = visibility;

    const [updated] = await db
      .update(posts)
      .set(patch)
      .where(eq(posts.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Post updated",
    });
  } catch (error: any) {
    console.error("[FACULTY_POST_PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}