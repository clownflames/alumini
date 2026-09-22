import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  user as userTable,
  alumniProfiles,
  connections,
  posts,
  events,
  jobs,
  jobApplications,
  notifications,
  conversations,
  conversationMembers,
} from "@/db/schema";
import { eq, desc, sql, and, ne, or } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserPlus,
  FileText,
  Calendar,
  Briefcase,
  Bell,
  CheckCircle2,
  AlertCircle,
  Heart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AlumniDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "alumni") redirect("/admin");

  const userId = session.user.id;

  /* ---------- Profile completion ---------- */
  const [profile] = await db
    .select()
    .from(alumniProfiles)
    .where(eq(alumniProfiles.userId, userId))
    .limit(1);

  /* ---------- Stats ---------- */
  const [
    connectionsCount,
    pendingRequestsCount,
    myPostsCount,
    eventsCount,
    jobsCount,
    applicationsCount,
    unreadNotificationsCount,
    unreadMessagesCount,
  ] = await Promise.all([
    // accepted connections (either direction)
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(connections)
      .where(
        and(
          eq(connections.status, "accepted"),
          or(
            eq(connections.requesterId, userId),
            eq(connections.receiverId, userId)
          )
        )
      ),
    // pending incoming requests
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(connections)
      .where(
        and(
          eq(connections.status, "pending"),
          eq(connections.receiverId, userId)
        )
      ),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(posts)
      .where(eq(posts.userId, userId)),
    db.select({ c: sql<number>`count(*)::int` }).from(events),
    db.select({ c: sql<number>`count(*)::int` }).from(jobs),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId)),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      ),
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(conversations)
      .innerJoin(
        conversationMembers,
        eq(conversationMembers.conversationId, conversations.id)
      )
      .where(eq(conversationMembers.userId, userId)),
  ]);

  const stats = {
    connections: connectionsCount[0]?.c ?? 0,
    pendingRequests: pendingRequestsCount[0]?.c ?? 0,
    myPosts: myPostsCount[0]?.c ?? 0,
    events: eventsCount[0]?.c ?? 0,
    jobs: jobsCount[0]?.c ?? 0,
    applications: applicationsCount[0]?.c ?? 0,
    unreadNotifications: unreadNotificationsCount[0]?.c ?? 0,
    conversations: unreadMessagesCount[0]?.c ?? 0,
  };

  /* ---------- Recent posts ---------- */
  const recentPosts = await db
    .select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      authorId: posts.userId,
      authorName: userTable.name,
      authorImage: userTable.image,
    })
    .from(posts)
    .leftJoin(userTable, eq(posts.userId, userTable.id))
    .orderBy(desc(posts.createdAt))
    .limit(5);

  /* ---------- Upcoming events ---------- */
  const upcomingEvents = await db
    .select({
      id: events.id,
      title: events.title,
      startAt: events.startAt,
      location: events.location,
      status: events.status,
    })
    .from(events)
    .where(eq(events.status, "published"))
    .orderBy(desc(events.startAt))
    .limit(5);

  /* ---------- Recent jobs ---------- */
  const recentJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      location: jobs.location,
      jobType: jobs.jobType,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .orderBy(desc(jobs.createdAt))
    .limit(5);

  /* ---------- Profile completion % ---------- */
  const profileFields = [
    profile?.firstName,
    profile?.lastName,
    profile?.headline,
    profile?.bio,
    profile?.phone,
    profile?.city,
    profile?.collegeId,
    profile?.departmentId,
    profile?.batchId,
    profile?.currentJobTitle,
  ];
  const filled = profileFields.filter(Boolean).length;
  const completionPct = Math.round((filled / profileFields.length) * 100);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back, {session.user.name?.split(" ")[0] || "Alumni"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's what's happening in your alumni network.
        </p>
      </div>

      {/* Profile completion banner */}
      {completionPct < 100 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              {completionPct < 50 ? (
                <AlertCircle className="size-5 text-destructive" />
              ) : (
                <CheckCircle2 className="size-5 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium">
                  Your profile is {completionPct}% complete
                </p>
                <p className="text-xs text-muted-foreground">
                  Complete your profile to get discovered by other alumni.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              render={<Link href="/dashboard/profile" />}
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Connections"
          value={stats.connections}
          icon={Users}
          href="/dashboard/connections"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={UserPlus}
          href="/dashboard/connections"
          highlight={stats.pendingRequests > 0}
        />
        <StatCard
          title="My Posts"
          value={stats.myPosts}
          icon={FileText}
          href="/dashboard/posts"
        />
        <StatCard
          title="Applications"
          value={stats.applications}
          icon={Briefcase}
          href="/dashboard/applications"
        />
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink
          href="/dashboard/directory"
          icon={Users}
          label="Browse Alumni"
        />
        <QuickLink
          href="/dashboard/events"
          icon={Calendar}
          label="Upcoming Events"
        />
        <QuickLink
          href="/dashboard/jobs"
          icon={Briefcase}
          label="Find Jobs"
        />
        <QuickLink
          href="/dashboard/mentorship"
          icon={Heart}
          label="Mentorship"
        />
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Recent Posts</CardTitle>
            <Link
              href="/dashboard/posts"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No posts yet.
              </p>
            )}
            {recentPosts.map((p) => (
              <div key={p.id} className="flex items-start gap-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={p.authorImage || undefined} />
                  <AvatarFallback>
                    {p.authorName ? initials(p.authorName) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {p.authorName || "Unknown"}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {p.content}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Upcoming Events</CardTitle>
            <Link
              href="/dashboard/events"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No events.
              </p>
            )}
            {upcomingEvents.map((e) => (
              <div
                key={e.id}
                className="flex flex-col border-b pb-2 last:border-0 last:pb-0"
              >
                <span className="truncate text-sm font-medium">
                  {e.title}
                </span>
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

        {/* Recent Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Recent Jobs</CardTitle>
            <Link
              href="/dashboard/jobs"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentJobs.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No jobs.
              </p>
            )}
            {recentJobs.map((j) => (
              <div
                key={j.id}
                className="flex flex-col border-b pb-2 last:border-0 last:pb-0"
              >
                <span className="truncate text-sm font-medium">
                  {j.title}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {j.jobType.replace("_", " ")}
                  </Badge>
                  {j.location && (
                    <span className="truncate text-xs text-muted-foreground">
                      {j.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  highlight,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-start justify-between gap-3 p-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p
              className={
                highlight && value > 0
                  ? "text-xl font-semibold text-primary"
                  : "text-xl font-semibold"
              }
            >
              {value.toLocaleString()}
            </p>
          </div>
          <div className="rounded-md bg-muted p-2">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-md bg-muted p-2">
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium">{label}</span>
        </CardContent>
      </Card>
    </Link>
  );
}