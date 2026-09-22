import { auth } from "@/lib/auth";
import { db } from "@/db";
import { announcements, colleges } from "@/db/schema";
import { desc, eq, ilike, or } from "drizzle-orm";
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

/* ---------- GET: list announcements ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireFaculty();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const audience = searchParams.get("audience");

  try {
    const rows = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        priority: announcements.priority,
        audience: announcements.audience,
        isPinned: announcements.isPinned,
        isPublished: announcements.isPublished,
        publishedAt: announcements.publishedAt,
        expiresAt: announcements.expiresAt,
        createdAt: announcements.createdAt,
        updatedAt: announcements.updatedAt,
        createdBy: announcements.createdBy,
        collegeId: announcements.collegeId,
        collegeName: colleges.name,
      })
      .from(announcements)
      .leftJoin(colleges, eq(announcements.collegeId, colleges.id))
      .where(
        q
          ? or(
              ilike(announcements.title, `%${q}%`),
              ilike(announcements.content, `%${q}%`)
            )
          : undefined
      )
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));

    const filtered = audience
      ? rows.filter((r) => r.audience === audience)
      : rows;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("[FACULTY_ANNOUNCEMENTS_GET]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch announcements",
      },
      { status: 500 }
    );
  }
}

/* ---------- POST: create announcement ---------- */
export async function POST(req: NextRequest) {
  const guard = await requireFaculty();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
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

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const published = !!isPublished;

    const [created] = await db
      .insert(announcements)
      .values({
        id,
        createdBy: guard.session.user.id,
        collegeId: collegeId || null,
        title: title.trim(),
        content: content.trim(),
        priority: priority || "normal",
        audience: audience || "all",
        isPinned: !!isPinned,
        isPublished: published,
        publishedAt: published ? new Date() : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Announcement created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[FACULTY_ANNOUNCEMENTS_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create" },
      { status: 500 }
    );
  }
}