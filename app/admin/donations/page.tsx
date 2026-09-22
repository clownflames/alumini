import { auth } from "@/lib/auth";
import { db } from "@/db";
import { donations, colleges, user as userTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DonationsClient } from "./donations-client";

export default async function DonationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "super_admin") redirect("/dashboard");

  const rows = await db
    .select({
      id: donations.id,
      amount: donations.amount,
      currency: donations.currency,
      status: donations.status,
      paymentProvider: donations.paymentProvider,
      paymentId: donations.paymentId,
      message: donations.message,
      createdAt: donations.createdAt,
      updatedAt: donations.updatedAt,
      userId: donations.userId,
      donorName: userTable.name,
      donorEmail: userTable.email,
      collegeId: donations.collegeId,
      collegeName: colleges.name,
    })
    .from(donations)
    .leftJoin(userTable, eq(donations.userId, userTable.id))
    .leftJoin(colleges, eq(donations.collegeId, colleges.id))
    .orderBy(desc(donations.createdAt));

  const collegeList = await db
    .select({ id: colleges.id, name: colleges.name })
    .from(colleges)
    .orderBy(colleges.name);

  const serialized = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <DonationsClient initialDonations={serialized} colleges={collegeList} />
  );
}