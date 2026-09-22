import { auth } from "@/lib/auth";
import { db } from "@/db";
import { connections } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
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

export async function POST(req: NextRequest) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const currentUserId = guard.session.user.id;

  try {
    const body = await req.json();
    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json(
        { success: false, error: "Receiver ID is required" },
        { status: 400 }
      );
    }

    if (receiverId === currentUserId) {
      return NextResponse.json(
        { success: false, error: "Cannot connect with yourself" },
        { status: 400 }
      );
    }

    // Check if already exists (either direction)
    const [existing] = await db
      .select()
      .from(connections)
      .where(
        or(
          and(
            eq(connections.requesterId, currentUserId),
            eq(connections.receiverId, receiverId)
          ),
          and(
            eq(connections.requesterId, receiverId),
            eq(connections.receiverId, currentUserId)
          )
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Connection already exists",
        },
        { status: 409 }
      );
    }

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(connections)
      .values({
        id,
        requesterId: currentUserId,
        receiverId,
        status: "pending",
      })
      .returning();

    return NextResponse.json(
      { success: true, data: created, message: "Connection request sent" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[CONNECTION_REQUEST_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send request" },
      { status: 500 }
    );
  }
}