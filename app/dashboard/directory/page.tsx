import { auth } from "@/lib/auth";
import { db } from "@/db";
import { colleges, departments, batches } from "@/db/schema";
import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DirectoryClient } from "./directory-client";

export default async function AlumniDirectoryPage() {
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

  const batchList = await db
    .select({ id: batches.id, year: batches.year })
    .from(batches)
    .orderBy(desc(batches.year));

  return (
    <DirectoryClient
      currentUserId={session.user.id}
      colleges={collegeList}
      departments={departmentList}
      batches={batchList}
    />
  );
}