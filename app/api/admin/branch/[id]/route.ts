import { auth } from "@/lib/auth";
import { db } from "@/db";
import { branches } from "@/db/schema";
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
    const { name, code, description, departmentId } = body;

    const patch: Record<string, any> = {};
    if (name !== undefined) patch.name = name.trim();
    if (code !== undefined) patch.code = code?.trim() || null;
    if (description !== undefined)
      patch.description = description?.trim() || null;
    if (departmentId !== undefined) patch.departmentId = departmentId;

    const [updated] = await db
      .update(branches)
      .set(patch)
      .where(eq(branches.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Branch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Branch updated",
    });
  } catch (error: any) {
    console.error("[BRANCH_PATCH]", error);

    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { success: false, error: "Duplicate branch name in department" },
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
      .delete(branches)
      .where(eq(branches.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Branch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Branch deleted",
    });
  } catch (error: any) {
    console.error("[BRANCH_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}