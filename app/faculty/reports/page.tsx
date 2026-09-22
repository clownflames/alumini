import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  user as userTable,
  alumniProfiles,
  events,
  jobs,
  jobApplications,
  donations,
  departments,
  batches,
  colleges,
} from "@/db/schema";
import { eq, sql, desc, and, gte, count } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReportsClient } from "./reports-client";

export default async function FacultyReportsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "admin") redirect("/dashboard");

  /* ---------- Overview counts ---------- */
  const [
    studentCount,
    alumniCount,
    facultyCount,
    verifiedAlumniCount,
    mentorAlumniCount,
    openToWorkCount,
  ] = await Promise.all([
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(userTable)
      .where(eq(userTable.role, "student")),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(userTable)
      .where(eq(userTable.role, "alumni")),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(userTable)
      .where(eq(userTable.role, "admin")),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(alumniProfiles)
      .where(eq(alumniProfiles.isVerified, true)),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(alumniProfiles)
      .where(eq(alumniProfiles.isMentor, true)),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(alumniProfiles)
      .where(eq(alumniProfiles.isOpenToWork, true)),
  ]);

  const overview = {
    students: studentCount[0]?.c ?? 0,
    alumni: alumniCount[0]?.c ?? 0,
    faculty: facultyCount[0]?.c ?? 0,
    verifiedAlumni: verifiedAlumniCount[0]?.c ?? 0,
    mentors: mentorAlumniCount[0]?.c ?? 0,
    openToWork: openToWorkCount[0]?.c ?? 0,
  };

  /* ---------- Students by department ---------- */
  const studentsByDeptRaw = await db
    .select({
      departmentId: alumniProfiles.departmentId,
      departmentName: departments.name,
      count: sql<number>`count(*)::int`,
    })
    .from(userTable)
    .leftJoin(alumniProfiles, eq(alumniProfiles.userId, userTable.id))
    .leftJoin(departments, eq(alumniProfiles.departmentId, departments.id))
    .where(eq(userTable.role, "student"))
    .groupBy(alumniProfiles.departmentId, departments.name)
    .orderBy(desc(sql`count(*)`));

  /* ---------- Alumni by department ---------- */
  const alumniByDeptRaw = await db
    .select({
      departmentId: alumniProfiles.departmentId,
      departmentName: departments.name,
      count: sql<number>`count(*)::int`,
    })
    .from(userTable)
    .leftJoin(alumniProfiles, eq(alumniProfiles.userId, userTable.id))
    .leftJoin(departments, eq(alumniProfiles.departmentId, departments.id))
    .where(eq(userTable.role, "alumni"))
    .groupBy(alumniProfiles.departmentId, departments.name)
    .orderBy(desc(sql`count(*)`));

  /* ---------- Alumni by batch year ---------- */
  const alumniByBatchRaw = await db
    .select({
      batchYear: batches.year,
      count: sql<number>`count(*)::int`,
    })
    .from(alumniProfiles)
    .leftJoin(batches, eq(alumniProfiles.batchId, batches.id))
    .groupBy(batches.year)
    .orderBy(desc(batches.year));

  /* ---------- Events summary ---------- */
  const [eventTotal] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(events);

  const eventsByStatusRaw = await db
    .select({
      status: events.status,
      count: sql<number>`count(*)::int`,
    })
    .from(events)
    .groupBy(events.status);

  const eventsByTypeRaw = await db
    .select({
      eventType: events.eventType,
      count: sql<number>`count(*)::int`,
    })
    .from(events)
    .groupBy(events.eventType);

  /* ---------- Jobs summary ---------- */
  const [jobTotal] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(jobs);

  const [appTotal] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(jobApplications);

  const jobsByTypeRaw = await db
    .select({
      jobType: jobs.jobType,
      count: sql<number>`count(*)::int`,
    })
    .from(jobs)
    .groupBy(jobs.jobType);

  const applicationsByStatusRaw = await db
    .select({
      status: jobApplications.status,
      count: sql<number>`count(*)::int`,
    })
    .from(jobApplications)
    .groupBy(jobApplications.status);

  /* ---------- Donations summary ---------- */
  const [donationAgg] = await db
    .select({
      total: sql<number>`coalesce(sum(${donations.amount}), 0)::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(donations)
    .where(eq(donations.status, "completed"));

  const reports = {
    overview,
    studentsByDept: studentsByDeptRaw.map((r) => ({
      department: r.departmentName || "Unassigned",
      count: r.count,
    })),
    alumniByDept: alumniByDeptRaw.map((r) => ({
      department: r.departmentName || "Unassigned",
      count: r.count,
    })),
    alumniByBatch: alumniByBatchRaw.map((r) => ({
      batch: r.batchYear?.toString() || "Unassigned",
      count: r.count,
    })),
    events: {
      total: eventTotal?.c ?? 0,
      byStatus: eventsByStatusRaw.map((r) => ({
        status: r.status,
        count: r.count,
      })),
      byType: eventsByTypeRaw.map((r) => ({
        type: r.eventType,
        count: r.count,
      })),
    },
    jobs: {
      total: jobTotal?.c ?? 0,
      applications: appTotal?.c ?? 0,
      byType: jobsByTypeRaw.map((r) => ({
        type: r.jobType,
        count: r.count,
      })),
      applicationsByStatus: applicationsByStatusRaw.map((r) => ({
        status: r.status,
        count: r.count,
      })),
    },
    donations: {
      total: donationAgg?.total ?? 0,
      count: donationAgg?.count ?? 0,
    },
  };

  return <ReportsClient reports={reports} />;
}