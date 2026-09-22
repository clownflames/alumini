import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ApplicationsClient } from "./applications-client";

export default async function AlumniApplicationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "alumni") redirect("/admin");

  return <ApplicationsClient currentUserId={session.user.id} />;
}