import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  messages,
  conversationMembers,
  user as userTable,
} from "@/db/schema";
import { and, eq, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

async function requireFaculty() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if ((session.user as any).role !== "admin") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const guard = await requireFaculty();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { conversationId } = await params;
  const currentUserId = guard.session.user.id;

  try {
    // Verify user is a member of this conversation
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
        { success: false, error: "Not a member of this conversation" },
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

    const serialized = rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error: any) {
    console.error("[FACULTY_MESSAGES_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}