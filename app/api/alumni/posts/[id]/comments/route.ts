import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  postComments,
  user as userTable,
} from "@/db/schema";
import { asc, eq } from "drizzle-orm";
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

/* ---------- GET comments ---------- */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  const currentUserId = guard.session.user.id;

  try {
    const rows = await db
      .select({
        id: postComments.id,
        postId: postComments.postId,
        userId: postComments.userId,
        userName: userTable.name,
        userImage: userTable.image,
        content: postComments.content,
        createdAt: postComments.createdAt,
      })
      .from(postComments)
      .leftJoin(userTable, eq(postComments.userId, userTable.id))
      .where(eq(postComments.postId, id))
      .orderBy(asc(postComments.createdAt));

    const data = rows.map((r) => ({
      id: r.id,
      postId: r.postId,
      userId: r.userId,
      userName: r.userName || "Unknown",
      userImage: r.userImage,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      isOwner: r.userId === currentUserId,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[ALUMNI_COMMENTS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}

/* ---------- POST comment ---------- */
export async function POST(
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
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment is required" },
        { status: 400 }
      );
    }

    const commentId = crypto.randomUUID();

    const [created] = await db
      .insert(postComments)
      .values({
        id: commentId,
        postId: id,
        userId: guard.session.user.id,
        content: content.trim(),
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Comment added" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ALUMNI_COMMENT_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to comment" },
      { status: 500 }
    );
  }
}