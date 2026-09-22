import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobs, companies } from "@/db/schema";
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

/* ---------- GET: list jobs ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const jobType = searchParams.get("jobType");

  try {
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
        postedBy: jobs.postedBy,
        companyId: jobs.companyId,
        companyName: companies.name,
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(
        q
          ? or(
              ilike(jobs.title, `%${q}%`),
              ilike(jobs.location, `%${q}%`)
            )
          : undefined
      )
      .orderBy(desc(jobs.createdAt));

    const filtered = jobType
      ? rows.filter((r) => r.jobType === jobType)
      : rows;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    console.error("[JOBS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

/* ---------- POST: create job ---------- */
export async function POST(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      companyId,
      companyName,
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

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Optional: create company inline if companyName given but no companyId
    let finalCompanyId: string | null = companyId || null;

    if (!finalCompanyId && companyName?.trim()) {
      const companyId2 = crypto.randomUUID();
      const [newCompany] = await db
        .insert(companies)
        .values({
          id: companyId2,
          name: companyName.trim(),
        })
        .returning();
      finalCompanyId = newCompany.id;
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(jobs)
      .values({
        id,
        postedBy: guard.session.user.id,
        companyId: finalCompanyId,
        title: title.trim(),
        description: description.trim(),
        location: location?.trim() || null,
        remote: !!remote,
        jobType: jobType || "full_time",
        experienceLevel: experienceLevel || null,
        salaryMin:
          salaryMin !== undefined && salaryMin !== "" && salaryMin !== null
            ? Number(salaryMin)
            : null,
        salaryMax:
          salaryMax !== undefined && salaryMax !== "" && salaryMax !== null
            ? Number(salaryMax)
            : null,
        salaryCurrency: salaryCurrency || "INR",
        applicationUrl: applicationUrl?.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Job created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[JOBS_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create job" },
      { status: 500 }
    );
  }
}