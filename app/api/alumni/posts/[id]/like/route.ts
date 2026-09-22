import { auth } from "@/lib/auth";
import { db } from "@/db";
import { postLikes } from "@/db/schema";
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  const userId = guard.session.user.id;

  try {
    // Check existing like
    const [existing] = await db
      .select()
      .from(postLikes)
      .where(
        and(eq(postLikes.postId, id), eq(postLikes.userId, userId))
      )
      .limit(1);

    if (existing) {
      // Unlike
      await db
        .delete(postLikes)
        .where(
          and(eq(postLikes.postId, id), eq(postLikes.userId, userId))
        );

      return NextResponse.json({
        success: true,
        liked: false,
        message: "Unliked",
      });
    } else {
      // Like
      await db.insert(postLikes).values({
        postId: id,
        userId,
      });

      return NextResponse.json({
        success: true,
        liked: true,
        message: "Liked",
      });
    }
  } catch (error: any) {
    console.error("[ALUMNI_POST_LIKE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed" },
      { status: 500 }
    );
  }
}