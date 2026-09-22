import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobApplications, jobs, companies } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
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

  try {
    const rows = await db
      .select({
        id: jobApplications.id,
        status: jobApplications.status,
        coverLetter: jobApplications.coverLetter,
        resumeUrl: jobApplications.resumeUrl,
        createdAt: jobApplications.createdAt,
        updatedAt: jobApplications.updatedAt,

        jobId: jobs.id,
        jobTitle: jobs.title,
        jobType: jobs.jobType,
        jobLocation: jobs.location,
        jobRemote: jobs.remote,
        jobExperienceLevel: jobs.experienceLevel,
        jobSalaryMin: jobs.salaryMin,
        jobSalaryMax: jobs.salaryMax,
        jobSalaryCurrency: jobs.salaryCurrency,

        companyName: companies.name,
        companyLogo: companies.logo,
      })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobApplications.userId, currentUserId))
      .orderBy(desc(jobApplications.createdAt));

    const data = rows.map((r) => ({
      id: r.id,
      status: r.status,
      coverLetter: r.coverLetter,
      resumeUrl: r.resumeUrl,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      jobId: r.jobId,
      jobTitle: r.jobTitle,
      jobType: r.jobType,
      jobLocation: r.jobLocation,
      jobRemote: r.jobRemote,
      jobExperienceLevel: r.jobExperienceLevel,
      jobSalaryMin: r.jobSalaryMin,
      jobSalaryMax: r.jobSalaryMax,
      jobSalaryCurrency: r.jobSalaryCurrency,
      companyName: r.companyName,
      companyLogo: r.companyLogo,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[ALUMNI_APPLICATIONS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}