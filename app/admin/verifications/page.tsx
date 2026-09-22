import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  verificationRequests,
  user as userTable,
  colleges,
  departments,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { VerificationsClient } from "./verifications-client";

export default async function VerificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "super_admin") redirect("/dashboard");

  const rows = await db
    .select({
      id: verificationRequests.id,
      fullName: verificationRequests.fullName,
      graduationYear: verificationRequests.graduationYear,
      rollNumber: verificationRequests.rollNumber,
      documentUrl: verificationRequests.documentUrl,
      additionalInfo: verificationRequests.additionalInfo,
      status: verificationRequests.status,
      rejectionReason: verificationRequests.rejectionReason,
      reviewedAt: verificationRequests.reviewedAt,
      reviewedBy: verificationRequests.reviewedBy,
      createdAt: verificationRequests.createdAt,
      updatedAt: verificationRequests.updatedAt,
      userId: verificationRequests.userId,
      userEmail: userTable.email,
      userImage: userTable.image,
      collegeId: verificationRequests.collegeId,
      collegeName: colleges.name,
      departmentId: verificationRequests.departmentId,
      departmentName: departments.name,
    })
    .from(verificationRequests)
    .leftJoin(userTable, eq(verificationRequests.userId, userTable.id))
    .leftJoin(colleges, eq(verificationRequests.collegeId, colleges.id))
    .leftJoin(
      departments,
      eq(verificationRequests.departmentId, departments.id)
    )
    .orderBy(
      desc(verificationRequests.status),
      desc(verificationRequests.createdAt)
    );

  const collegeList = await db
    .select({ id: colleges.id, name: colleges.name })
    .from(colleges)
    .orderBy(colleges.name);

  const departmentList = await db
    .select({ id: departments.id, name: departments.name })
    .from(departments)
    .orderBy(departments.name);

  const serialized = rows.map((r) => ({
    ...r,
    reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <VerificationsClient
      initialRequests={serialized}
      colleges={collegeList}
      departments={departmentList}
    />
  );
}