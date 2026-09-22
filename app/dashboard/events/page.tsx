import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EventsClient } from "./events-client";

export default async function AlumniEventsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "alumni") redirect("/admin");

  return <EventsClient currentUserId={session.user.id} />;
}