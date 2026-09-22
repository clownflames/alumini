import { auth } from "@/lib/auth";
import { db } from "@/db";
import { donations, colleges, user as userTable } from "@/db/schema";
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

/* ---------- GET: list donations ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const collegeId = searchParams.get("collegeId");

  try {
    const rows = await db
      .select({
        id: donations.id,
        amount: donations.amount,
        currency: donations.currency,
        status: donations.status,
        paymentProvider: donations.paymentProvider,
        paymentId: donations.paymentId,
        message: donations.message,
        createdAt: donations.createdAt,
        updatedAt: donations.updatedAt,
        userId: donations.userId,
        donorName: userTable.name,
        donorEmail: userTable.email,
        collegeId: donations.collegeId,
        collegeName: colleges.name,
      })
      .from(donations)
      .leftJoin(userTable, eq(donations.userId, userTable.id))
      .leftJoin(colleges, eq(donations.collegeId, colleges.id))
      .orderBy(desc(donations.createdAt));

    const filtered = rows.filter((r) => {
      if (status && r.status !== status) return false;
      if (collegeId && r.collegeId !== collegeId) return false;
      return true;
    });

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("[DONATIONS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch donations" },
      { status: 500 }
    );
  }
}

/* ---------- POST: create donation (manual entry) ---------- */
export async function POST(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const {
      userId,
      collegeId,
      amount,
      currency,
      status,
      paymentProvider,
      paymentId,
      message,
    } = body;

    if (amount === undefined || amount === null || amount === "") {
      return NextResponse.json(
        { success: false, error: "Amount is required" },
        { status: 400 }
      );
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(donations)
      .values({
        id,
        userId: userId || null,
        collegeId: collegeId || null,
        amount: numAmount,
        currency: currency || "INR",
        status: status || "pending",
        paymentProvider: paymentProvider?.trim() || null,
        paymentId: paymentId?.trim() || null,
        message: message?.trim() || null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Donation created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[DONATIONS_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create donation" },
      { status: 500 }
    );
  }
}