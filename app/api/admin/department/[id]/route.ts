import { auth } from "@/lib/auth";
import { db } from "@/db";
import { departments } from "@/db/schema";
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

/* ---------- PATCH: update ---------- */
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
    const { name, code, description } = body;

    const [updated] = await db
      .update(departments)
      .set({
        ...(name !== undefined && { name: name.trim() }),
        ...(code !== undefined && { code: code?.trim() || null }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
      })
      .where(eq(departments.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Department updated",
    });
  } catch (error: any) {
    console.error("[DEPARTMENT_PATCH]", error);
    if (error?.code === "23505") {
      return NextResponse.json(
        { success: false, error: "Duplicate department name" },
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
      .delete(departments)
      .where(eq(departments.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Department deleted",
    });
  } catch (error: any) {
    console.error("[DEPARTMENT_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}