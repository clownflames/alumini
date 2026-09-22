import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  connections,
  user as userTable,
  alumniProfiles,
} from "@/db/schema";
import { and, desc, eq, ne, or, aliasedTable } from "drizzle-orm";
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
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // accepted | pending | rejected | blocked | all
  const scope = searchParams.get("scope"); // sent | received | all

  try {
    // Build condition based on scope
    let whereCondition;

    if (scope === "sent") {
      whereCondition = eq(connections.requesterId, currentUserId);
    } else if (scope === "received") {
      whereCondition = eq(connections.receiverId, currentUserId);
    } else {
      whereCondition = or(
        eq(connections.requesterId, currentUserId),
        eq(connections.receiverId, currentUserId)
      );
    }

    // Add status filter if provided (and not "all")
    if (status && status !== "all") {
      whereCondition = and(
        whereCondition,
        eq(
          connections.status,
          status as "pending" | "accepted" | "rejected" | "blocked"
        )
      );
    }

    // Use aliases for the two user joins
    const otherUser = aliasedTable(userTable, "other_user");
    const otherProfile = aliasedTable(alumniProfiles, "other_profile");

    const rows = await db
      .select({
        id: connections.id,
        status: connections.status,
        createdAt: connections.createdAt,
        updatedAt: connections.updatedAt,
        requesterId: connections.requesterId,
        receiverId: connections.receiverId,

        otherUserId: otherUser.id,
        otherName: otherUser.name,
        otherEmail: otherUser.email,
        otherImage: otherUser.image,
        otherHeadline: otherProfile.headline,
        otherJobTitle: otherProfile.currentJobTitle,
        otherCity: otherProfile.city,
      })
      .from(connections)
      // JOIN other user: either requester or receiver
      .leftJoin(
        otherUser,
        or(
          and(
            eq(connections.requesterId, otherUser.id),
            ne(connections.requesterId, currentUserId)
          ),
          and(
            eq(connections.receiverId, otherUser.id),
            ne(connections.receiverId, currentUserId)
          )
        )
      )
      .leftJoin(
        otherProfile,
        eq(otherProfile.userId, otherUser.id)
      )
      .where(whereCondition)
      .orderBy(desc(connections.updatedAt));

    /* ---------- Map with direction ---------- */
    const data = rows.map((r) => ({
      id: r.id,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      requesterId: r.requesterId,
      receiverId: r.receiverId,
      otherUserId: r.otherUserId || "",
      otherName: r.otherName || "Unknown",
      otherEmail: r.otherEmail || "",
      otherImage: r.otherImage,
      otherHeadline: r.otherHeadline,
      otherJobTitle: r.otherJobTitle,
      otherCity: r.otherCity,
      direction:
        r.requesterId === currentUserId
          ? ("sent" as const)
          : ("received" as const),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[ALUMNI_CONNECTIONS_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}