import { auth } from "@/lib/auth";
import { db } from "@/db";
import { donations } from "@/db/schema";
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
    const {
      amount,
      currency,
      status,
      paymentProvider,
      paymentId,
      message,
      collegeId,
    } = body;

    const patch: Record<string, any> = {};
    if (amount !== undefined) {
      const num = Number(amount);
      if (isNaN(num) || num <= 0) {
        return NextResponse.json(
          { success: false, error: "Amount must be a positive number" },
          { status: 400 }
        );
      }
      patch.amount = num;
    }
    if (currency !== undefined) patch.currency = currency || "INR";
    if (status !== undefined) patch.status = status;
    if (paymentProvider !== undefined)
      patch.paymentProvider = paymentProvider?.trim() || null;
    if (paymentId !== undefined) patch.paymentId = paymentId?.trim() || null;
    if (message !== undefined) patch.message = message?.trim() || null;
    if (collegeId !== undefined) patch.collegeId = collegeId || null;

    const [updated] = await db
      .update(donations)
      .set(patch)
      .where(eq(donations.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Donation updated",
    });
  } catch (error: any) {
    console.error("[DONATION_PATCH]", error);
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
      .delete(donations)
      .where(eq(donations.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Donation deleted",
    });
  } catch (error: any) {
    console.error("[DONATION_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}