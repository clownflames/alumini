import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  user as userTable,
  alumniProfiles,
  alumniEducation,
  alumniExperience,
  socialLinks,
  colleges,
  departments,
  batches,
} from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function AlumniProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "alumni") redirect("/admin");

  const userId = session.user.id;

  /* ---------- User basic ---------- */
  const [user] = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  if (!user) redirect("/login");

  /* ---------- Alumni profile ---------- */
  const [profile] = await db
    .select()
    .from(alumniProfiles)
    .where(eq(alumniProfiles.userId, userId))
    .limit(1);

  /* ---------- Education ---------- */
  const education = await db
    .select()
    .from(alumniEducation)
    .where(eq(alumniEducation.userId, userId))
    .orderBy(desc(alumniEducation.endYear));

  /* ---------- Experience ---------- */
  const experience = await db
    .select()
    .from(alumniExperience)
    .where(eq(alumniExperience.userId, userId))
    .orderBy(desc(alumniExperience.startDate));

  /* ---------- Social links ---------- */
  const links = await db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.userId, userId))
    .orderBy(asc(socialLinks.platform));

  /* ---------- Lookup data ---------- */
  const collegeList = await db
    .select({ id: colleges.id, name: colleges.name })
    .from(colleges)
    .orderBy(colleges.name);

  const departmentList = await db
    .select({ id: departments.id, name: departments.name })
    .from(departments)
    .orderBy(departments.name);

  const batchList = await db
    .select({ id: batches.id, year: batches.year })
    .from(batches)
    .orderBy(desc(batches.year));

  /* ---------- Serialize ---------- */
  const profileSerialized = {
    id: profile?.id ?? null,
    userId,
    firstName: profile?.firstName ?? null,
    lastName: profile?.lastName ?? null,
    headline: profile?.headline ?? null,
    bio: profile?.bio ?? null,
    phone: profile?.phone ?? null,
    dateOfBirth: profile?.dateOfBirth
      ? profile.dateOfBirth.toISOString()
      : null,
    gender: profile?.gender ?? null,
    city: profile?.city ?? null,
    state: profile?.state ?? null,
    country: profile?.country ?? null,
    postalCode: profile?.postalCode ?? null,
    currentJobTitle: profile?.currentJobTitle ?? null,
    graduationYear: profile?.graduationYear ?? null,
    collegeId: profile?.collegeId ?? null,
    departmentId: profile?.departmentId ?? null,
    batchId: profile?.batchId ?? null,
    profileCompleted: profile?.profileCompleted ?? false,
    isVerified: profile?.isVerified ?? false,
    isOpenToWork: profile?.isOpenToWork ?? false,
    isMentor: profile?.isMentor ?? false,
    allowMessages: profile?.allowMessages ?? true,
  };

  const educationSerialized = education.map((e) => ({
    ...e,
  }));

  const experienceSerialized = experience.map((e) => ({
    ...e,
    startDate: e.startDate ? e.startDate.toISOString() : null,
    endDate: e.endDate ? e.endDate.toISOString() : null,
  }));

  return (
    <ProfileClient
      user={user}
      profile={profileSerialized}
      education={educationSerialized}
      experience={experienceSerialized}
      socialLinks={links}
      colleges={collegeList}
      departments={departmentList}
      batches={batchList}
    />
  );
}