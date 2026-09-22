import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  posts,
  user as userTable,
  alumniProfiles,
  postLikes,
  postComments,
  connections,
} from "@/db/schema";
import {
  and,
  desc,
  eq,
  inArray,
  ne,
  or,
  sql,
} from "drizzle-orm";
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

/* ---------- GET: feed ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const currentUserId = guard.session.user.id;

  try {
    /* ---------- Get my accepted connections ---------- */
    const myConns = await db
      .select({
        requesterId: connections.requesterId,
        receiverId: connections.receiverId,
      })
      .from(connections)
      .where(
        and(
          eq(connections.status, "accepted"),
          or(
            eq(connections.requesterId, currentUserId),
            eq(connections.receiverId, currentUserId)
          )
        )
      );

    const connectionIds = myConns.map((c) =>
      c.requesterId === currentUserId ? c.receiverId : c.requesterId
    );

    /* ---------- Fetch posts ---------- */
    // Visible posts:
    //   - public (anyone)
    //   - connections (only if author is me OR in my connection list)
    //   - private (only if author is me)
    const visibilityCondition = or(
      eq(posts.visibility, "public"),
      eq(posts.userId, currentUserId),
      and(
        eq(posts.visibility, "connections"),
        connectionIds.length > 0
          ? inArray(posts.userId, connectionIds)
          : sql`false`
      )
    );

    const rows = await db
      .select({
        id: posts.id,
        content: posts.content,
        image: posts.image,
        visibility: posts.visibility,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        userId: posts.userId,
        authorName: userTable.name,
        authorImage: userTable.image,
        authorHeadline: alumniProfiles.headline,
      })
      .from(posts)
      .leftJoin(userTable, eq(posts.userId, userTable.id))
      .leftJoin(alumniProfiles, eq(alumniProfiles.userId, posts.userId))
      .where(visibilityCondition)
      .orderBy(desc(posts.createdAt))
      .limit(100);

    const postIds = rows.map((r) => r.id);

    /* ---------- Like counts + my likes ---------- */
    let likeCountMap: Record<string, number> = {};
    let myLikes = new Set<string>();

    if (postIds.length > 0) {
      const likeCounts = await db
        .select({
          postId: postLikes.postId,
          count: sql<number>`count(*)::int`,
        })
        .from(postLikes)
        .where(inArray(postLikes.postId, postIds))
        .groupBy(postLikes.postId);

      for (const r of likeCounts) {
        likeCountMap[r.postId] = r.count;
      }

      const myLikeRows = await db
        .select({ postId: postLikes.postId })
        .from(postLikes)
        .where(
          and(
            inArray(postLikes.postId, postIds),
            eq(postLikes.userId, currentUserId)
          )
        );

      myLikes = new Set(myLikeRows.map((r) => r.postId));
    }

    /* ---------- Comment counts ---------- */
    let commentCountMap: Record<string, number> = {};

    if (postIds.length > 0) {
      const commentCounts = await db
        .select({
          postId: postComments.postId,
          count: sql<number>`count(*)::int`,
        })
        .from(postComments)
        .where(inArray(postComments.postId, postIds))
        .groupBy(postComments.postId);

      for (const r of commentCounts) {
        commentCountMap[r.postId] = r.count;
      }
    }

    /* ---------- Build response ---------- */
    const data = rows.map((r) => ({
      id: r.id,
      content: r.content,
      image: r.image,
      visibility: r.visibility,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      author: {
        id: r.userId,
        name: r.authorName || "Unknown",
        image: r.authorImage,
        headline: r.authorHeadline,
      },
      isOwner: r.userId === currentUserId,
      likeCount: likeCountMap[r.id] || 0,
      commentCount: commentCountMap[r.id] || 0,
      isLikedByMe: myLikes.has(r.id),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[ALUMNI_POSTS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}

/* ---------- POST: create post ---------- */
export async function POST(req: NextRequest) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const { content, image, visibility } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(posts)
      .values({
        id,
        userId: guard.session.user.id,
        content: content.trim(),
        image: image?.trim() || null,
        visibility: visibility || "public",
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Post created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ALUMNI_POSTS_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create" },
      { status: 500 }
    );
  }
}