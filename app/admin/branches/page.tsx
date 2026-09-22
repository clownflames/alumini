import { auth } from "@/lib/auth";
import { db } from "@/db";
import { branches, departments, colleges } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BranchesClient } from "./branches-client";

export default async function BranchesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "super_admin") redirect("/dashboard");

  const rows = await db
    .select({
      id: branches.id,
      name: branches.name,
      code: branches.code,
      description: branches.description,
      createdAt: branches.createdAt,
      updatedAt: branches.updatedAt,
      departmentId: branches.departmentId,
      departmentName: departments.name,
    })
    .from(branches)
    .leftJoin(departments, eq(branches.departmentId, departments.id))
    .orderBy(desc(branches.createdAt));

  const departmentList = await db
    .select({
      id: departments.id,
      name: departments.name,
      collegeName: colleges.name,
    })
    .from(departments)
    .leftJoin(colleges, eq(departments.collegeId, colleges.id))
    .orderBy(departments.name);

  const serialized = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <BranchesClient
      initialBranches={serialized}
      departments={departmentList}
    />
  );
}