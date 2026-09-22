"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import { NewConversationDrawer } from "./new-conversation-drawer";
import type { Conversation } from "./message-types";

export function MessagesClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alumni/messages");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setConversations(json.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Messages</h1>
          <p className="text-sm text-muted-foreground">
            Chat with your alumni connections.
          </p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="mr-2 size-4" />
          New Message
        </Button>
      </div>

      {/* Split pane */}
      <div
        className="flex overflow-hidden rounded-md border"
        style={{ height: "calc(100vh - 14rem)" }}
      >
        {/* Left: conversations */}
        <div className="w-full max-w-sm shrink-0">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : (
            <ConversationList
              conversations={filtered}
              activeId={activeId}
              onSelect={setActiveId}
              query={query}
              onQueryChange={setQuery}
            />
          )}
        </div>

        {/* Right: thread */}
        <div className="flex-1">
          {active ? (
            <MessageThread
              key={active.id}
              conversationId={active.id}
              currentUserId={currentUserId}
              otherUserName={active.otherUserName}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
              <MessageSquare className="size-10" />
              <p className="text-sm">
                Select a conversation or start a new one
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewOpen(true)}
              >
                <Plus className="mr-2 size-4" />
                New Message
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* New conversation drawer */}
      <NewConversationDrawer
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={async (id) => {
          await fetchData();
          setActiveId(id);
        }}
      />
    </div>
  );
}