import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  conversations,
  conversationMembers,
  messages,
  user as userTable,
} from "@/db/schema";
import { and, desc, eq, ne, sql, inArray } from "drizzle-orm";
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

/* ---------- GET: conversations list ---------- */
export async function GET(req: NextRequest) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const currentUserId = guard.session.user.id;

  try {
    /* ---------- Step 1: my conversations ---------- */
    const myConvs = await db
      .select({
        id: conversations.id,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .innerJoin(
        conversationMembers,
        eq(conversationMembers.conversationId, conversations.id)
      )
      .where(eq(conversationMembers.userId, currentUserId))
      .orderBy(desc(conversations.updatedAt));

    if (myConvs.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const convIds = myConvs.map((c) => c.id);

    /* ---------- Step 2: all members of those conversations ---------- */
    const allMembers = await db
      .select({
        conversationId: conversationMembers.conversationId,
        userId: conversationMembers.userId,
      })
      .from(conversationMembers)
      .where(inArray(conversationMembers.conversationId, convIds));

    /* ---------- Step 3: unique other user IDs ---------- */
    const otherIdsSet = new Set<string>();
    for (const m of allMembers) {
      if (m.userId !== currentUserId) otherIdsSet.add(m.userId);
    }
    const otherIds = Array.from(otherIdsSet);

    /* ---------- Step 4: fetch users ---------- */
    const userMap: Record<
      string,
      { name: string; email: string; image: string | null }
    > = {};

    if (otherIds.length > 0) {
      const users = await db
        .select({
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
          image: userTable.image,
        })
        .from(userTable)
        .where(inArray(userTable.id, otherIds));

      for (const u of users) {
        userMap[u.id] = {
          name: u.name,
          email: u.email,
          image: u.image,
        };
      }
    }

    /* ---------- Step 5: last messages + unread counts ---------- */
    const lastMessages = await db
      .select({
        conversationId: messages.conversationId,
        content: messages.content,
        type: messages.type,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(inArray(messages.conversationId, convIds))
      .orderBy(desc(messages.createdAt));

    // Keep only the first (latest) per conversation
    const lastByConv: Record<
      string,
      { content: string | null; type: string; createdAt: Date }
    > = {};
    for (const m of lastMessages) {
      if (!lastByConv[m.conversationId]) {
        lastByConv[m.conversationId] = {
          content: m.content,
          type: m.type,
          createdAt: m.createdAt,
        };
      }
    }

    // Unread per conversation
    const unreadRows = await db
      .select({
        conversationId: messages.conversationId,
        count: sql<number>`count(*)::int`,
      })
      .from(messages)
      .where(
        and(
          inArray(messages.conversationId, convIds),
          eq(messages.isRead, false),
          ne(messages.senderId, currentUserId)
        )
      )
      .groupBy(messages.conversationId);

    const unreadMap: Record<string, number> = {};
    for (const r of unreadRows) {
      unreadMap[r.conversationId] = r.count;
    }

    /* ---------- Step 6: build response ---------- */
    const data: any[] = myConvs.map((conv) => {
      // members of this conversation
      const convMembers = allMembers.filter(
        (m) => m.conversationId === conv.id
      );
      const memberCount = convMembers.length;

      // other participant
      const otherMember = convMembers.find(
        (m) => m.userId !== currentUserId
      );
      const otherUser = otherMember ? userMap[otherMember.userId] : null;

      // last message
      const last = lastByConv[conv.id];

      let lastPreview: string | null = null;
      if (last) {
        lastPreview =
          last.type === "text"
            ? last.content
            : last.type === "image"
              ? "📷 Image"
              : "📎 File";
      }

      return {
        id: conv.id,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
        otherUserId: otherMember?.userId ?? null,
        otherUserName: otherUser?.name ?? null,
        otherUserEmail: otherUser?.email ?? null,
        otherUserImage: otherUser?.image ?? null,
        memberCount,
        lastMessage: lastPreview,
        lastMessageAt: last?.createdAt.toISOString() ?? null,
        unreadCount: unreadMap[conv.id] ?? 0,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[ALUMNI_MESSAGES_GET]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}

/* ---------- POST: create conversation with another user ---------- */
export async function POST(req: NextRequest) {
  const guard = await requireAlumni();
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const currentUserId = guard.session.user.id;

  try {
    const body = await req.json();
    const { otherUserId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, error: "otherUserId is required" },
        { status: 400 }
      );
    }

    if (otherUserId === currentUserId) {
      return NextResponse.json(
        { success: false, error: "Cannot message yourself" },
        { status: 400 }
      );
    }

    // Check if conversation already exists between these two users
    const existing = await db
      .select({
        id: conversationMembers.conversationId,
      })
      .from(conversationMembers)
      .where(
        inArray(
          conversationMembers.conversationId,
          db
            .select({ id: conversationMembers.conversationId })
            .from(conversationMembers)
            .where(eq(conversationMembers.userId, currentUserId))
        )
      )
      .groupBy(conversationMembers.conversationId)
      .having(sql`count(*) = 2 and sum(case when ${conversationMembers.userId} = ${otherUserId} then 1 else 0 end) = 1`);

    // Existing conversation
    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        data: { id: existing[0].id },
        message: "Conversation already exists",
      });
    }

    // Create new
    const convId = crypto.randomUUID();

    await db.insert(conversations).values({ id: convId });

    await db.insert(conversationMembers).values([
      { conversationId: convId, userId: currentUserId },
      { conversationId: convId, userId: otherUserId },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: { id: convId },
        message: "Conversation created",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ALUMNI_MESSAGES_POST]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create" },
      { status: 500 }
    );
  }
}