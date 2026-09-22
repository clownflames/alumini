import { auth } from "@/lib/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
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
    const { content, image, visibility } = body;

    const patch: Record<string, any> = {};
    if (content !== undefined) patch.content = content.trim();
    if (image !== undefined) patch.image = image?.trim() || null;
    if (visibility !== undefined) patch.visibility = visibility;

    const [updated] = await db
      .update(posts)
      .set(patch)
      .where(
        and(eq(posts.id, id), eq(posts.userId, guard.session.user.id))
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Post updated",
    });
  } catch (error: any) {
    console.error("[ALUMNI_POST_PATCH]", error);
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
      .delete(posts)
      .where(
        and(eq(posts.id, id), eq(posts.userId, guard.session.user.id))
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Post deleted",
    });
  } catch (error: any) {
    console.error("[ALUMNI_POST_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}