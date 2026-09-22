import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  user as userTable,
  alumniProfiles,
  colleges,
  departments,
  batches,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AlumniClient } from "./alumni-client";

export default async function FacultyAlumniPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "admin") redirect("/dashboard");

  const rows = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
      emailVerified: userTable.emailVerified,
      status: userTable.status,
      createdAt: userTable.createdAt,

      firstName: alumniProfiles.firstName,
      lastName: alumniProfiles.lastName,
      headline: alumniProfiles.headline,
      bio: alumniProfiles.bio,
      phone: alumniProfiles.phone,
      city: alumniProfiles.city,
      state: alumniProfiles.state,
      country: alumniProfiles.country,
      currentJobTitle: alumniProfiles.currentJobTitle,
      graduationYear: alumniProfiles.graduationYear,
      profileCompleted: alumniProfiles.profileCompleted,
      isVerified: alumniProfiles.isVerified,
      isOpenToWork: alumniProfiles.isOpenToWork,
      isMentor: alumniProfiles.isMentor,

      collegeName: colleges.name,
      departmentName: departments.name,
      batchYear: batches.year,
    })
    .from(userTable)
    .leftJoin(alumniProfiles, eq(alumniProfiles.userId, userTable.id))
    .leftJoin(colleges, eq(alumniProfiles.collegeId, colleges.id))
    .leftJoin(departments, eq(alumniProfiles.departmentId, departments.id))
    .leftJoin(batches, eq(alumniProfiles.batchId, batches.id))
    .where(eq(userTable.role, "alumni"))
    .orderBy(desc(userTable.createdAt));

  const serialized = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return <AlumniClient initialAlumni={serialized} />;
}