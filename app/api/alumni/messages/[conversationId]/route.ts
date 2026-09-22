import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  messages,
  conversationMembers,
  user as userTable,
} from "@/db/schema";
import { and, asc, eq, ne, or } from "drizzle-orm";
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { conversationId } = await params;
  const currentUserId = guard.session.user.id;

  try {
    // Verify membership
    const [membership] = await db
      .select({ userId: conversationMembers.userId })
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, currentUserId)
        )
      )
      .limit(1);

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "Not a member" },
        { status: 403 }
      );
    }

    const rows = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        senderName: userTable.name,
        senderImage: userTable.image,
        content: messages.content,
        type: messages.type,
        attachmentUrl: messages.attachmentUrl,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .leftJoin(userTable, eq(messages.senderId, userTable.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));

    // Mark incoming messages as read
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderId, currentUserId),
          eq(messages.isRead, false)
        )
      );

    const serialized = rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error: any) {
    console.error("[ALUMNI_CONVERSATION_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}