import { auth } from "@/lib/auth";
import { db } from "@/db";
import { colleges, departments } from "@/db/schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MentorshipClient } from "./mentorship-client";

export default async function AlumniMentorshipPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "alumni") redirect("/admin");

  const collegeList = await db
    .select({ id: colleges.id, name: colleges.name })
    .from(colleges)
    .orderBy(colleges.name);

  const departmentList = await db
    .select({ id: departments.id, name: departments.name })
    .from(departments)
    .orderBy(departments.name);

  return (
    <MentorshipClient
      currentUserId={session.user.id}
      colleges={collegeList}
      departments={departmentList}
    />
  );
}