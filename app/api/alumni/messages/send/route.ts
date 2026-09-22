import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  messages,
  conversationMembers,
  conversations,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
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
    const { conversationId, content, type, attachmentUrl } = body;

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "conversationId is required" },
        { status: 400 }
      );
    }

    const msgType = type || "text";

    if (msgType === "text" && !content?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required" },
        { status: 400 }
      );
    }

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

    const id = crypto.randomUUID();

    const [created] = await db
      .insert(messages)
      .values({
        id,
        conversationId,
        senderId: currentUserId,
        content: content?.trim() || null,
        type: msgType,
        attachmentUrl: attachmentUrl?.trim() || null,
        isRead: false,
      })
      .returning();

    // Update conversation updatedAt
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json(
      { success: true, data: created, message: "Message sent" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ALUMNI_MESSAGE_SEND]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send" },
      { status: 500 }
    );
  }
}