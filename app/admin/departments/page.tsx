import { auth } from "@/lib/auth";
import { db } from "@/db";
import { departments, colleges } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DepartmentClient } from "./department-client";

export default async function DepartmentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "super_admin") redirect("/dashboard");

  const rows = await db
    .select({
      id: departments.id,
      name: departments.name,
      code: departments.code,
      description: departments.description,
      createdAt: departments.createdAt,
      collegeId: departments.collegeId,
      collegeName: colleges.name,
    })
    .from(departments)
    .leftJoin(colleges, eq(departments.collegeId, colleges.id))
    .orderBy(desc(departments.createdAt));

  const collegeList = await db
    .select({ id: colleges.id, name: colleges.name })
    .from(colleges)
    .orderBy(colleges.name);

  // Serialize dates
  const serialized = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <DepartmentClient
      initialDepartments={serialized}
      colleges={collegeList}
    />
  );
}