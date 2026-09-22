import { auth } from "@/lib/auth";
import { db } from "@/db";
import { posts, user as userTable } from "@/db/schema";
import { desc, eq, ilike } from "drizzle-orm";
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

/* ---------- GET: list posts ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireFaculty();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const visibility = searchParams.get("visibility");

  try {
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
        authorEmail: userTable.email,
        authorImage: userTable.image,
      })
      .from(posts)
      .leftJoin(userTable, eq(posts.userId, userTable.id))
      .where(q ? ilike(posts.content, `%${q}%`) : undefined)
      .orderBy(desc(posts.createdAt));

    const filtered = visibility
      ? rows.filter((r) => r.visibility === visibility)
      : rows;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("[FACULTY_POSTS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

/* ---------- POST: create post ---------- */
export async function POST(req: NextRequest) {
  const guard = await requireFaculty();
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
    console.error("[FACULTY_POSTS_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}