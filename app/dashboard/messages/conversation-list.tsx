"use client";

import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Conversation } from "./message-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return format(d, "HH:mm");
  return format(d, "dd MMM");
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  query,
  onQueryChange,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  query: string;
  onQueryChange: (v: string) => void;
}) {
  return (
    <div className="flex h-full flex-col border-r">
      {/* Search */}
      <div className="border-b p-3">
        <input
          type="text"
          placeholder="Search conversations..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
            No conversations found.
          </div>
        )}

        {conversations.map((c) => {
          const isActive = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b p-3 text-left transition-colors hover:bg-accent/50",
                isActive && "bg-accent"
              )}
            >
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={c.otherUserImage || undefined} />
                <AvatarFallback>
                  {c.otherUserName ? initials(c.otherUserName) : "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {c.otherUserName || "Unknown"}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatTime(c.lastMessageAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-muted-foreground">
                    {c.lastMessage || "No messages yet"}
                  </span>
                  {c.unreadCount > 0 && (
                    <Badge className="h-5 shrink-0 px-1.5 text-xs">
                      {c.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}