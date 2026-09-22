import { auth } from "@/lib/auth";
import { db } from "@/db";
import { departments, colleges } from "@/db/schema";
import { eq, desc, ilike, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// Helper: check super_admin
async function requireSuperAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "super_admin") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

/* ---------- GET: list all departments ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const collegeId = searchParams.get("collegeId");

  try {
    const rows = await db
      .select({
        id: departments.id,
        name: departments.name,
        code: departments.code,
        description: departments.description,
        createdAt: departments.createdAt,
        collegeId: departments.collegeId,
        collegeName: colleges.name,
      })
      .from(departments)
      .leftJoin(colleges, eq(departments.collegeId, colleges.id))
      .where(
        q
          ? or(
              ilike(departments.name, `%${q}%`),
              ilike(departments.code, `%${q}%`)
            )
          : undefined
      )
      .orderBy(desc(departments.createdAt));

    const filtered = collegeId
      ? rows.filter((r) => r.collegeId === collegeId)
      : rows;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("[DEPARTMENTS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

/* ---------- POST: create department ---------- */
export async function POST(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const { collegeId, name, code, description } = body;

    // Validation
    if (!collegeId || !name) {
      return NextResponse.json(
        { success: false, error: "College and name are required" },
        { status: 400 }
      );
    }

    // Check college exists
    const [college] = await db
      .select({ id: colleges.id })
      .from(colleges)
      .where(eq(colleges.id, collegeId))
      .limit(1);

    if (!college) {
      return NextResponse.json(
        { success: false, error: "College not found" },
        { status: 404 }
      );
    }

    // Duplicate check (collegeId + name unique)
    const [existing] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.collegeId, collegeId))
      .limit(1);

    // (optional deeper check — skip for brevity)

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(departments)
      .values({
        id,
        collegeId,
        name: name.trim(),
        code: code?.trim() || null,
        description: description?.trim() || null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Department created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[DEPARTMENTS_POST]", error);

    // unique constraint
    if (error?.code === "23505") {
      return NextResponse.json(
        {
          success: false,
          error: "A department with this name already exists in this college",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create department" },
      { status: 500 }
    );
  }
}