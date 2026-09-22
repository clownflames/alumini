import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  jobs,
  companies,
  jobApplications,
} from "@/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
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

export async function GET(req: NextRequest) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const currentUserId = guard.session.user.id;
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.trim();
  const jobType = searchParams.get("jobType");
  const experience = searchParams.get("experience");
  const remote = searchParams.get("remote") === "true";
  const appliedOnly = searchParams.get("applied") === "true";

  try {
    const conditions: any[] = [];

    // Exclude expired jobs (unless applied)
    if (!appliedOnly) {
      conditions.push(
        or(
          sql`${jobs.expiresAt} IS NULL`,
          sql`${jobs.expiresAt} >= NOW()`
        )!
      );
    }

    if (q) {
      conditions.push(
        or(
          ilike(jobs.title, `%${q}%`),
          ilike(jobs.location, `%${q}%`),
          ilike(companies.name, `%${q}%`)
        )!
      );
    }

    if (jobType) {
      conditions.push(eq(jobs.jobType, jobType as any));
    }

    if (experience) {
      conditions.push(eq(jobs.experienceLevel, experience as any));
    }

    if (remote) {
      conditions.push(eq(jobs.remote, true));
    }

    /* ---------- Fetch jobs ---------- */
    const rows = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        location: jobs.location,
        remote: jobs.remote,
        jobType: jobs.jobType,
        experienceLevel: jobs.experienceLevel,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        salaryCurrency: jobs.salaryCurrency,
        applicationUrl: jobs.applicationUrl,
        expiresAt: jobs.expiresAt,
        createdAt: jobs.createdAt,
        companyName: companies.name,
        companyLogo: companies.logo,
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(jobs.createdAt))
      .limit(200);

    const jobIds = rows.map((r) => r.id);

    /* ---------- Fetch my applications ---------- */
    const applicationMap: Record<
      string,
      { status: string }
    > = {};

    if (jobIds.length > 0) {
      const apps = await db
        .select({
          jobId: jobApplications.jobId,
          status: jobApplications.status,
        })
        .from(jobApplications)
        .where(
          and(
            inArray(jobApplications.jobId, jobIds),
            eq(jobApplications.userId, currentUserId)
          )
        );

      for (const a of apps) {
        applicationMap[a.jobId] = { status: a.status };
      }
    }

    /* ---------- If appliedOnly, filter to only applied jobs ---------- */
    let finalRows = rows;
    if (appliedOnly) {
      finalRows = rows.filter((r) => applicationMap[r.id]);
    }

    /* ---------- Build response ---------- */
    const data = finalRows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      companyName: r.companyName,
      companyLogo: r.companyLogo,
      location: r.location,
      remote: r.remote,
      jobType: r.jobType,
      experienceLevel: r.experienceLevel,
      salaryMin: r.salaryMin,
      salaryMax: r.salaryMax,
      salaryCurrency: r.salaryCurrency,
      applicationUrl: r.applicationUrl,
      expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      hasApplied: !!applicationMap[r.id],
      applicationStatus: (applicationMap[r.id]?.status as any) || null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[ALUMNI_JOBS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}