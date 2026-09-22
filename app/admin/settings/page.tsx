import { auth } from "@/lib/auth";
import { db } from "@/db";
import { colleges } from "@/db/schema";
import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "super_admin") redirect("/dashboard");

  const collegeRows = await db
    .select()
    .from(colleges)
    .orderBy(desc(colleges.createdAt));

  // Serialize dates for client
  const serialized = collegeRows.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <SettingsClient initialColleges={serialized} />;
}