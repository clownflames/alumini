import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user as userTable, alumniProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export default async function AlumniSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "alumni") redirect("/admin");

  const [user] = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
    })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  if (!user) redirect("/login");

  const [profile] = await db
    .select()
    .from(alumniProfiles)
    .where(eq(alumniProfiles.userId, session.user.id))
    .limit(1);

  const settings = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    allowMessages: profile?.allowMessages ?? true,
    isOpenToWork: profile?.isOpenToWork ?? false,
    isMentor: profile?.isMentor ?? false,
  };

  return <SettingsClient profile={settings} />;
}