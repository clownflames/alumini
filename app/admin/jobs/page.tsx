import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobs, companies } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { JobsClient } from "./jobs-client";

export default async function JobsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "super_admin") redirect("/dashboard");

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
    .orderBy(desc(jobs.createdAt));

  const companyList = await db
    .select({ id: companies.id, name: companies.name })
    .from(companies)
    .orderBy(companies.name);

  const serialized = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
  }));

  return <JobsClient initialJobs={serialized} companies={companyList} />;
}