"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import type { Conversation } from "./message-types";

export function MessagesClient({
  initialConversations,
  currentUserId,
}: {
  initialConversations: Conversation[];
  currentUserId: string;
}) {
  const [conversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = conversations.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (c.otherUserName || "").toLowerCase().includes(q) ||
      (c.otherUserEmail || "").toLowerCase().includes(q) ||
      (c.lastMessage || "").toLowerCase().includes(q)
    );
  });

  const active = conversations.find((c) => c.id === activeId) || null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          View your conversations and student/alumni communication.
        </p>
      </div>

      {/* Split pane */}
      <div
        className="flex overflow-hidden rounded-md border"
        style={{ height: "calc(100vh - 14rem)" }}
      >
        {/* Left: conversations */}
        <div className="w-full max-w-sm shrink-0">
          <ConversationList
            conversations={filtered}
            activeId={activeId}
            onSelect={setActiveId}
            query={query}
            onQueryChange={setQuery}
          />
        </div>

        {/* Right: thread */}
        <div className="flex-1">
          {active ? (
            <MessageThread
              conversationId={active.id}
              currentUserId={currentUserId}
              otherUserName={active.otherUserName}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
              <MessageSquare className="size-10" />
              <p className="text-sm">
                Select a conversation to view messages
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}