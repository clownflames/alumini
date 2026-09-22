import { auth } from "@/lib/auth";
import { db } from "@/db";
import { batches, colleges } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BatchesClient } from "./batches-client";

export default async function BatchesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "super_admin") redirect("/dashboard");

  const rows = await db
    .select({
      id: batches.id,
      year: batches.year,
      startYear: batches.startYear,
      endYear: batches.endYear,
      createdAt: batches.createdAt,
      collegeId: batches.collegeId,
      collegeName: colleges.name,
    })
    .from(batches)
    .leftJoin(colleges, eq(batches.collegeId, colleges.id))
    .orderBy(desc(batches.year));

  const collegeList = await db
    .select({ id: colleges.id, name: colleges.name })
    .from(colleges)
    .orderBy(colleges.name);

  const serialized = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return <BatchesClient initialBatches={serialized} colleges={collegeList} />;
}