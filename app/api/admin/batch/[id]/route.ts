import { auth } from "@/lib/auth";
import { db } from "@/db";
import { batches } from "@/db/schema";
import { eq } from "drizzle-orm";
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

/* ---------- PATCH ---------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { year, startYear, endYear } = body;

    const patch: Record<string, any> = {};
    if (year !== undefined) {
      const y = Number(year);
      if (isNaN(y) || y < 1900 || y > 2100) {
        return NextResponse.json(
          { success: false, error: "Year must be between 1900 and 2100" },
          { status: 400 }
        );
      }
      patch.year = y;
    }
    if (startYear !== undefined)
      patch.startYear =
        startYear === "" || startYear === null ? null : Number(startYear);
    if (endYear !== undefined)
      patch.endYear =
        endYear === "" || endYear === null ? null : Number(endYear);

    const [updated] = await db
      .update(batches)
      .set(patch)
      .where(eq(batches.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Batch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Batch updated",
    });
  } catch (error: any) {
    console.error("[BATCH_PATCH]", error);

    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { success: false, error: "Batch for this year already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}

/* ---------- DELETE ---------- */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(batches)
      .where(eq(batches.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Batch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Batch deleted",
    });
  } catch (error: any) {
    console.error("[BATCH_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}