import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  verificationRequests,
  alumniProfiles,
  user as userTable,
} from "@/db/schema";
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
    const { status, rejectionReason } = body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Fetch current request
    const [current] = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.id, id))
      .limit(1);

    if (!current) {
      return NextResponse.json(
        { success: false, error: "Verification request not found" },
        { status: 404 }
      );
    }

    const patch: Record<string, any> = {
      status,
      reviewedBy: guard.session.user.id,
      reviewedAt: new Date(),
      rejectionReason:
        status === "rejected" ? rejectionReason?.trim() || null : null,
    };

    const [updated] = await db
      .update(verificationRequests)
      .set(patch)
      .where(eq(verificationRequests.id, id))
      .returning();

    // Side-effect: mark alumni profile verified on approval
    if (status === "approved") {
      await db
        .update(alumniProfiles)
        .set({ isVerified: true })
        .where(eq(alumniProfiles.userId, current.userId));
    } else if (status === "rejected") {
      await db
        .update(alumniProfiles)
        .set({ isVerified: false })
        .where(eq(alumniProfiles.userId, current.userId));
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Request ${status}`,
    });
  } catch (error: any) {
    console.error("[VERIFICATION_PATCH]", error);
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
      .delete(verificationRequests)
      .where(eq(verificationRequests.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Verification request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification request deleted",
    });
  } catch (error: any) {
    console.error("[VERIFICATION_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}