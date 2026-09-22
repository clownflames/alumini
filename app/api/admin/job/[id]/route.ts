import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobs } from "@/db/schema";
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
      title,
      description,
      companyId,
      location,
      remote,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      salaryCurrency,
      applicationUrl,
      expiresAt,
    } = body;

    const patch: Record<string, any> = {};
    if (title !== undefined) patch.title = title.trim();
    if (description !== undefined) patch.description = description.trim();
    if (companyId !== undefined) patch.companyId = companyId || null;
    if (location !== undefined) patch.location = location?.trim() || null;
    if (remote !== undefined) patch.remote = !!remote;
    if (jobType !== undefined) patch.jobType = jobType;
    if (experienceLevel !== undefined)
      patch.experienceLevel = experienceLevel || null;
    if (salaryMin !== undefined)
      patch.salaryMin =
        salaryMin === "" || salaryMin === null ? null : Number(salaryMin);
    if (salaryMax !== undefined)
      patch.salaryMax =
        salaryMax === "" || salaryMax === null ? null : Number(salaryMax);
    if (salaryCurrency !== undefined)
      patch.salaryCurrency = salaryCurrency || "INR";
    if (applicationUrl !== undefined)
      patch.applicationUrl = applicationUrl?.trim() || null;
    if (expiresAt !== undefined)
      patch.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const [updated] = await db
      .update(jobs)
      .set(patch)
      .where(eq(jobs.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Job updated",
    });
  } catch (error: any) {
    console.error("[JOB_PATCH]", error);
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
      .delete(jobs)
      .where(eq(jobs.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Job deleted",
    });
  } catch (error: any) {
    console.error("[JOB_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}