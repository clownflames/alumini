import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  connections,
  user as userTable,
  alumniProfiles,
} from "@/db/schema";
import { and, eq, inArray, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

async function requireAlumni() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "alumni") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

export async function GET(req: NextRequest) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const currentUserId = guard.session.user.id;

  try {
    // Accepted connections
    const conns = await db
      .select({
        requesterId: connections.requesterId,
        receiverId: connections.receiverId,
      })
      .from(connections)
      .where(
        and(
          eq(connections.status, "accepted"),
          or(
            eq(connections.requesterId, currentUserId),
            eq(connections.receiverId, currentUserId)
          )
        )
      );

    const otherIds = conns.map((c) =>
      c.requesterId === currentUserId ? c.receiverId : c.requesterId
    );

    if (otherIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const users = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        image: userTable.image,
        headline: alumniProfiles.headline,
      })
      .from(userTable)
      .leftJoin(alumniProfiles, eq(alumniProfiles.userId, userTable.id))
      .where(inArray(userTable.id, otherIds));

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error("[ALUMNI_CONTACTS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}