import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ConnectionsClient } from "./connections-client";

export default async function AlumniConnectionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "alumni") redirect("/admin");

  return <ConnectionsClient currentUserId={session.user.id} />;
}