import { auth } from "@/lib/auth";
import { db } from "@/db";
import { branches, departments } from "@/db/schema";
import { desc, eq, ilike, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

async function requireSuperAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "super_admin") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

function isUniqueViolation(err: any): boolean {
  let current = err;
  while (current) {
    if (current.code === "23505") return true;
    current = current.cause;
  }
  return false;
}

/* ---------- GET: list branches ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const departmentId = searchParams.get("departmentId");

  try {
    const rows = await db
      .select({
        id: branches.id,
        name: branches.name,
        code: branches.code,
        description: branches.description,
        createdAt: branches.createdAt,
        updatedAt: branches.updatedAt,
        departmentId: branches.departmentId,
        departmentName: departments.name,
      })
      .from(branches)
      .leftJoin(departments, eq(branches.departmentId, departments.id))
      .where(
        q
          ? or(
              ilike(branches.name, `%${q}%`),
              ilike(branches.code, `%${q}%`)
            )
          : undefined
      )
      .orderBy(desc(branches.createdAt));

    const filtered = departmentId
      ? rows.filter((r) => r.departmentId === departmentId)
      : rows;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("[BRANCHES_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch branches" },
      { status: 500 }
    );
  }
}

/* ---------- POST: create branch ---------- */
export async function POST(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const { departmentId, name, code, description } = body;

    if (!departmentId || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Department and name are required" },
        { status: 400 }
      );
    }

    // Verify department exists
    const [dept] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.id, departmentId))
      .limit(1);

    if (!dept) {
      return NextResponse.json(
        { success: false, error: "Department not found" },
        { status: 404 }
      );
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(branches)
      .values({
        id,
        departmentId,
        name: name.trim(),
        code: code?.trim() || null,
        description: description?.trim() || null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Branch created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[BRANCHES_POST]", error);

    if (isUniqueViolation(error)) {
      return NextResponse.json(
        {
          success: false,
          error: "A branch with this name already exists in this department",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create branch" },
      { status: 500 }
    );
  }
}