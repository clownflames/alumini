import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  user as userTable,
  alumniProfiles,
  events,
  jobs,
  donations,
  colleges,
  departments,
  batches,
  posts,
  verificationRequests,
} from "@/db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardOverview } from "./dashboard-overview";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "super_admin") redirect("/dashboard");

  /* ---------- Counts ---------- */
  const [
    alumniCountRes,
    studentCountRes,
    facultyCountRes,
    collegeCountRes,
    departmentCountRes,
    batchCountRes,
    eventCountRes,
    jobCountRes,
    postCountRes,
    donationSumRes,
    pendingVerifRes,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(userTable)
      .where(eq(userTable.role, "alumni")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(userTable)
      .where(eq(userTable.role, "student")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(userTable)
      .where(eq(userTable.role, "admin")),
    db.select({ count: sql<number>`count(*)::int` }).from(colleges),
    db.select({ count: sql<number>`count(*)::int` }).from(departments),
    db.select({ count: sql<number>`count(*)::int` }).from(batches),
    db.select({ count: sql<number>`count(*)::int` }).from(events),
    db.select({ count: sql<number>`count(*)::int` }).from(jobs),
    db.select({ count: sql<number>`count(*)::int` }).from(posts),
    db
      .select({
        total: sql<number>`coalesce(sum(${donations.amount}), 0)::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(donations)
      .where(eq(donations.status, "completed")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(verificationRequests)
      .where(eq(verificationRequests.status, "pending")),
  ]);

  const stats = {
    alumni: alumniCountRes[0]?.count ?? 0,
    students: studentCountRes[0]?.count ?? 0,
    faculty: facultyCountRes[0]?.count ?? 0,
    colleges: collegeCountRes[0]?.count ?? 0,
    departments: departmentCountRes[0]?.count ?? 0,
    batches: batchCountRes[0]?.count ?? 0,
    events: eventCountRes[0]?.count ?? 0,
    jobs: jobCountRes[0]?.count ?? 0,
    posts: postCountRes[0]?.count ?? 0,
    donationsTotal: donationSumRes[0]?.total ?? 0,
    donationsCount: donationSumRes[0]?.count ?? 0,
    pendingVerifications: pendingVerifRes[0]?.count ?? 0,
  };

  /* ---------- Recent activity ---------- */
  const recentAlumni = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .where(eq(userTable.role, "alumni"))
    .orderBy(desc(userTable.createdAt))
    .limit(5);

  const recentEvents = await db
    .select({
      id: events.id,
      title: events.title,
      startAt: events.startAt,
      status: events.status,
      location: events.location,
    })
    .from(events)
    .orderBy(desc(events.createdAt))
    .limit(5);

  const recentDonations = await db
    .select({
      id: donations.id,
      amount: donations.amount,
      currency: donations.currency,
      status: donations.status,
      createdAt: donations.createdAt,
      donorName: userTable.name,
    })
    .from(donations)
    .leftJoin(userTable, eq(donations.userId, userTable.id))
    .orderBy(desc(donations.createdAt))
    .limit(5);

  /* ---------- Serialize dates ---------- */
  const serialize = <T extends Record<string, any>>(rows: T[]) =>
    rows.map((r) => {
      const out: any = { ...r };
      for (const k of Object.keys(out)) {
        if (out[k] instanceof Date) out[k] = out[k].toISOString();
      }
      return out;
    });

  return (
    <DashboardOverview
      userName={session.user.name || "Admin"}
      stats={stats}
      recentAlumni={serialize(recentAlumni)}
      recentEvents={serialize(recentEvents)}
      recentDonations={serialize(recentDonations)}
    />
  );
}