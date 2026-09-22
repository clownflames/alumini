import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  verificationRequests,
  user as userTable,
  colleges,
  departments,
} from "@/db/schema";
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

/* ---------- GET: list verification requests ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");

  try {
    const rows = await db
      .select({
        id: verificationRequests.id,
        fullName: verificationRequests.fullName,
        graduationYear: verificationRequests.graduationYear,
        rollNumber: verificationRequests.rollNumber,
        documentUrl: verificationRequests.documentUrl,
        additionalInfo: verificationRequests.additionalInfo,
        status: verificationRequests.status,
        rejectionReason: verificationRequests.rejectionReason,
        reviewedAt: verificationRequests.reviewedAt,
        reviewedBy: verificationRequests.reviewedBy,
        createdAt: verificationRequests.createdAt,
        updatedAt: verificationRequests.updatedAt,
        userId: verificationRequests.userId,
        userEmail: userTable.email,
        userImage: userTable.image,
        collegeId: verificationRequests.collegeId,
        collegeName: colleges.name,
        departmentId: verificationRequests.departmentId,
        departmentName: departments.name,
      })
      .from(verificationRequests)
      .leftJoin(userTable, eq(verificationRequests.userId, userTable.id))
      .leftJoin(
        colleges,
        eq(verificationRequests.collegeId, colleges.id)
      )
      .leftJoin(
        departments,
        eq(verificationRequests.departmentId, departments.id)
      )
      .where(
        q
          ? or(
              ilike(verificationRequests.fullName, `%${q}%`),
              ilike(verificationRequests.rollNumber, `%${q}%`),
              ilike(userTable.email, `%${q}%`)
            )
          : undefined
      )
      .orderBy(
        desc(verificationRequests.status),
        desc(verificationRequests.createdAt)
      );

    const filtered = status
      ? rows.filter((r) => r.status === status)
      : rows;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("[VERIFICATIONS_GET]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch verification requests",
      },
      { status: 500 }
    );
  }
}

/* ---------- POST: create verification request ---------- */
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
      departmentId,
      batchId,
      fullName,
      graduationYear,
      rollNumber,
      documentUrl,
      additionalInfo,
    } = body;

    if (!userId || !fullName?.trim()) {
      return NextResponse.json(
        { success: false, error: "User and full name are required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(verificationRequests)
      .values({
        id,
        userId,
        collegeId: collegeId || null,
        departmentId: departmentId || null,
        batchId: batchId || null,
        fullName: fullName.trim(),
        graduationYear:
          graduationYear !== undefined &&
          graduationYear !== null &&
          graduationYear !== ""
            ? Number(graduationYear)
            : null,
        rollNumber: rollNumber?.trim() || null,
        documentUrl: documentUrl?.trim() || null,
        additionalInfo: additionalInfo?.trim() || null,
        status: "pending",
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Verification request created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[VERIFICATIONS_POST]", error);

    let current = error;
    while (current) {
      if (current.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            error: "A verification request already exists for this user",
          },
          { status: 409 }
        );
      }
      current = current.cause;
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create request" },
      { status: 500 }
    );
  }
}