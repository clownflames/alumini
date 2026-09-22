import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  user as userTable,
  events,
  jobs,
  posts,
} from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Users,
  GraduationCap,
  Calendar,
  Briefcase,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function FacultyDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "admin") redirect("/dashboard");

  /* ---------- Stats ---------- */
  const [
    studentCountRes,
    alumniCountRes,
    upcomingEventsRes,
    activeJobsRes,
    myPostsRes,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(userTable)
      .where(eq(userTable.role, "student")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(userTable)
      .where(eq(userTable.role, "alumni")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(eq(events.status, "published")),
    db.select({ count: sql<number>`count(*)::int` }).from(jobs),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(eq(posts.userId, session.user.id)),
  ]);

  const stats = {
    students: studentCountRes[0]?.count ?? 0,
    alumni: alumniCountRes[0]?.count ?? 0,
    events: upcomingEventsRes[0]?.count ?? 0,
    jobs: activeJobsRes[0]?.count ?? 0,
    myPosts: myPostsRes[0]?.count ?? 0,
  };

  /* ---------- Recent items ---------- */
  const recentStudents = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .where(eq(userTable.role, "student"))
    .orderBy(desc(userTable.createdAt))
    .limit(5);

  const upcomingEvents = await db
    .select({
      id: events.id,
      title: events.title,
      startAt: events.startAt,
      location: events.location,
    })
    .from(events)
    .where(eq(events.status, "published"))
    .orderBy(desc(events.startAt))
    .limit(5);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome, {session.user.name || "Faculty"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's an overview of students, alumni and upcoming activities.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Students"
          value={stats.students}
          icon={Users}
          href="/faculty/students"
        />
        <StatCard
          title="Alumni"
          value={stats.alumni}
          icon={GraduationCap}
          href="/faculty/alumni"
        />
        <StatCard
          title="Events"
          value={stats.events}
          icon={Calendar}
          href="/faculty/events"
        />
        <StatCard
          title="Jobs"
          value={stats.jobs}
          icon={Briefcase}
          href="/faculty/reports"
        />
        <StatCard
          title="My Posts"
          value={stats.myPosts}
          icon={FileText}
          href="/faculty/posts"
        />
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentStudents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No students yet.
              </p>
            )}
            {recentStudents.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 border-b pb-2 last:border-0 last:pb-0"
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">
                    {s.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {s.email}
                  </span>
                </div>
                <Link
                  href="/faculty/students"
                  className="text-xs text-primary hover:underline"
                >
                  View
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No published events.
              </p>
            )}
            {upcomingEvents.map((e) => (
              <div
                key={e.id}
                className="flex flex-col border-b pb-2 last:border-0 last:pb-0"
              >
                <span className="text-sm font-medium">{e.title}</span>
                <span className="text-xs text-muted-foreground">
                  {e.startAt.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {e.location ? ` · ${e.location}` : ""}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-start justify-between gap-3 p-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-semibold">{value.toLocaleString()}</p>
          </div>
          <div className="rounded-md bg-muted p-2">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}