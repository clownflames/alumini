import { auth } from "@/lib/auth";
import { db } from "@/db";
import { batches, colleges } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
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

/* ---------- GET: list batches ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(req.url);
  const collegeId = searchParams.get("collegeId");

  try {
    const rows = await db
      .select({
        id: batches.id,
        year: batches.year,
        startYear: batches.startYear,
        endYear: batches.endYear,
        createdAt: batches.createdAt,
        collegeId: batches.collegeId,
        collegeName: colleges.name,
      })
      .from(batches)
      .leftJoin(colleges, eq(batches.collegeId, colleges.id))
      .orderBy(desc(batches.year));

    const filtered = collegeId
      ? rows.filter((r) => r.collegeId === collegeId)
      : rows;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("[BATCHES_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

/* ---------- POST: create batch ---------- */
export async function POST(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const { collegeId, year, startYear, endYear } = body;

    if (!collegeId || !year) {
      return NextResponse.json(
        { success: false, error: "College and year are required" },
        { status: 400 }
      );
    }

    const y = Number(year);
    if (isNaN(y) || y < 1900 || y > 2100) {
      return NextResponse.json(
        { success: false, error: "Year must be between 1900 and 2100" },
        { status: 400 }
      );
    }

    // Verify college
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

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(batches)
      .values({
        id,
        collegeId,
        year: y,
        startYear:
          startYear !== undefined && startYear !== "" && startYear !== null
            ? Number(startYear)
            : null,
        endYear:
          endYear !== undefined && endYear !== "" && endYear !== null
            ? Number(endYear)
            : null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Batch created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[BATCHES_POST]", error);

    if (isUniqueViolation(error)) {
      return NextResponse.json(
        {
          success: false,
          error: "A batch for this year already exists in this college",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create batch" },
      { status: 500 }
    );
  }
}