import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  mentorships,
  user as userTable,
  alumniProfiles,
} from "@/db/schema";
import { desc, eq, aliasedTable } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MentorshipClient } from "./mentorship-client";

export default async function FacultyMentorshipPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "admin") redirect("/dashboard");

  const mentorUser = aliasedTable(userTable, "mentor_user");
  const menteeUser = aliasedTable(userTable, "mentee_user");
  const mentorProfile = aliasedTable(alumniProfiles, "mentor_profile");

  const rows = await db
    .select({
      id: mentorships.id,
      focus: mentorships.focus,
      status: mentorships.status,
      requestMessage: mentorships.requestMessage,
      goal: mentorships.goal,
      startedAt: mentorships.startedAt,
      endedAt: mentorships.endedAt,
      createdAt: mentorships.createdAt,
      updatedAt: mentorships.updatedAt,

      mentorId: mentorships.mentorId,
      mentorName: mentorUser.name,
      mentorEmail: mentorUser.email,
      mentorImage: mentorUser.image,
      mentorHeadline: mentorProfile.headline,
      mentorJobTitle: mentorProfile.currentJobTitle,

      menteeId: mentorships.menteeId,
      menteeName: menteeUser.name,
      menteeEmail: menteeUser.email,
      menteeImage: menteeUser.image,
    })
    .from(mentorships)
    .leftJoin(mentorUser, eq(mentorships.mentorId, mentorUser.id))
    .leftJoin(menteeUser, eq(mentorships.menteeId, menteeUser.id))
    .leftJoin(
      mentorProfile,
      eq(mentorProfile.userId, mentorships.mentorId)
    )
    .orderBy(desc(mentorships.createdAt));

  const serialized = rows.map((r) => ({
    ...r,
    startedAt: r.startedAt ? r.startedAt.toISOString() : null,
    endedAt: r.endedAt ? r.endedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <MentorshipClient initialMentorships={serialized} />;
}