import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobs, jobApplications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

async function requireAlumni() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "alumni") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  const userId = guard.session.user.id;

  try {
    /* ---------- Validate job ---------- */
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1);

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Job has expired" },
        { status: 400 }
      );
    }

    /* ---------- Check duplicate ---------- */
    const [existing] = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.jobId, id),
          eq(jobApplications.userId, userId)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { success: false, error: "You have already applied" },
        { status: 409 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { coverLetter, resumeUrl } = body;

    const applicationId = crypto.randomUUID();

    const [created] = await db
      .insert(jobApplications)
      .values({
        id: applicationId,
        jobId: id,
        userId,
        resumeUrl: resumeUrl?.trim() || null,
        coverLetter: coverLetter?.trim() || null,
        status: "applied",
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: created,
        message: "Application submitted",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ALUMNI_JOB_APPLY]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to apply" },
      { status: 500 }
    );
  }
}