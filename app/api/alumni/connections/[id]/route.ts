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

/* ---------- PATCH: accept / reject / block ---------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  const currentUserId = guard.session.user.id;

  try {
    const body = await req.json();
    const { status } = body;

    if (!["accepted", "rejected", "blocked"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Only the receiver can accept/reject a pending connection
    const [existing] = await db
      .select()
      .from(connections)
      .where(eq(connections.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Connection not found" },
        { status: 404 }
      );
    }

    // Must be a party to the connection
    if (
      existing.requesterId !== currentUserId &&
      existing.receiverId !== currentUserId
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Only receiver can accept/reject
    if (
      existing.receiverId !== currentUserId &&
      (status === "accepted" || status === "rejected")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Only the receiver can accept or reject",
        },
        { status: 403 }
      );
    }

    const [updated] = await db
      .update(connections)
      .set({ status })
      .where(eq(connections.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Connection ${status}`,
    });
  } catch (error: any) {
    console.error("[ALUMNI_CONNECTION_PATCH]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}

/* ---------- DELETE: remove connection ---------- */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { id } = await params;
  const currentUserId = guard.session.user.id;

  try {
    const [deleted] = await db
      .delete(connections)
      .where(
        and(
          eq(connections.id, id),
          or(
            eq(connections.requesterId, currentUserId),
            eq(connections.receiverId, currentUserId)
          )
        )
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Connection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Connection removed",
    });
  } catch (error: any) {
    console.error("[ALUMNI_CONNECTION_DELETE]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed" },
      { status: 500 }
    );
  }
}