import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  conversations,
  conversationMembers,
  messages,
  user as userTable,
} from "@/db/schema";
import { desc, eq, and, ne, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MessagesClient } from "./messages-client";

export default async function FacultyMessagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "admin") redirect("/dashboard");

  const currentUserId = session.user.id;

  /* ---------- 1. Faculty ki conversations ---------- */
  const myConversations = await db
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

  /* ---------- 2. For each conversation, fetch other participant + last message ---------- */
  const enriched = await Promise.all(
    myConversations.map(async (conv) => {
      // other member
      const [otherMember] = await db
        .select({
          name: userTable.name,
          email: userTable.email,
          image: userTable.image,
        })
        .from(conversationMembers)
        .innerJoin(userTable, eq(conversationMembers.userId, userTable.id))
        .where(
          and(
            eq(conversationMembers.conversationId, conv.id),
            ne(conversationMembers.userId, currentUserId)
          )
        )
        .limit(1);

      // member count
      const [{ count: memberCount }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(conversationMembers)
        .where(eq(conversationMembers.conversationId, conv.id));

      // last message
      const [lastMsg] = await db
        .select({
          content: messages.content,
          createdAt: messages.createdAt,
          type: messages.type,
        })
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      // unread count
      const [{ count: unreadCount }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conv.id),
            eq(messages.isRead, false),
            ne(messages.senderId, currentUserId)
          )
        );

      return {
        id: conv.id,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
        otherUserName: otherMember?.name ?? null,
        otherUserEmail: otherMember?.email ?? null,
        otherUserImage: otherMember?.image ?? null,
        memberCount,
        lastMessage:
          lastMsg?.type === "text"
            ? lastMsg.content
            : lastMsg?.type === "image"
              ? "📷 Image"
              : lastMsg?.type === "file"
                ? "📎 File"
                : null,
        lastMessageAt: lastMsg?.createdAt
          ? lastMsg.createdAt.toISOString()
          : null,
        unreadCount,
      };
    })
  );

  return (
    <MessagesClient
      initialConversations={enriched}
      currentUserId={currentUserId}
    />
  );
}