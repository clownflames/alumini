import { auth } from "@/lib/auth";
import { db } from "@/db";
import { colleges } from "@/db/schema";
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
    const {
      name,
      shortName,
      description,
      website,
      logo,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
    } = body;

    const patch: Record<string, any> = {};
    if (name !== undefined) patch.name = name.trim();
    if (shortName !== undefined) patch.shortName = shortName?.trim() || null;
    if (description !== undefined)
      patch.description = description?.trim() || null;
    if (website !== undefined) patch.website = website?.trim() || null;
    if (logo !== undefined) patch.logo = logo?.trim() || null;
    if (email !== undefined) patch.email = email?.trim() || null;
    if (phone !== undefined) patch.phone = phone?.trim() || null;
    if (address !== undefined) patch.address = address?.trim() || null;
    if (city !== undefined) patch.city = city?.trim() || null;
    if (state !== undefined) patch.state = state?.trim() || null;
    if (country !== undefined) patch.country = country?.trim() || "India";
    if (postalCode !== undefined)
      patch.postalCode = postalCode?.trim() || null;

    const [updated] = await db
      .update(colleges)
      .set(patch)
      .where(eq(colleges.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "College updated",
    });
  } catch (error: any) {
    console.error("[COLLEGE_PATCH]", error);

    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { success: false, error: "Duplicate college name" },
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
      .delete(colleges)
      .where(eq(colleges.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "College not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "College deleted",
    });
  } catch (error: any) {
    console.error("[COLLEGE_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}