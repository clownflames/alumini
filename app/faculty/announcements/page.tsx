import { auth } from "@/lib/auth";
import { db } from "@/db";
import { announcements, colleges } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AnnouncementsClient } from "./announcements-client";

export default async function FacultyAnnouncementsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "admin") redirect("/dashboard");

  const rows = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      content: announcements.content,
      priority: announcements.priority,
      audience: announcements.audience,
      isPinned: announcements.isPinned,
      isPublished: announcements.isPublished,
      publishedAt: announcements.publishedAt,
      expiresAt: announcements.expiresAt,
      createdAt: announcements.createdAt,
      updatedAt: announcements.updatedAt,
      createdBy: announcements.createdBy,
      collegeId: announcements.collegeId,
      collegeName: colleges.name,
    })
    .from(announcements)
    .leftJoin(colleges, eq(announcements.collegeId, colleges.id))
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));

  const collegeList = await db
    .select({ id: colleges.id, name: colleges.name })
    .from(colleges)
    .orderBy(colleges.name);

  const serialized = rows.map((r) => ({
    ...r,
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
    expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <AnnouncementsClient
      initialAnnouncements={serialized}
      colleges={collegeList}
      currentUserId={session.user.id}
    />
  );
}