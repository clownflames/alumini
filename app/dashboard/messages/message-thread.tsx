"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Message } from "./message-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MessageThread({
  conversationId,
  currentUserId,
  otherUserName,
}: {
  conversationId: string;
  currentUserId: string;
  otherUserName: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ---------- Load messages ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/alumni/messages/${conversationId}`
        );
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);
        if (!cancelled) setMessages(json.data);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  /* ---------- Auto scroll ---------- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* ---------- Send ---------- */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;

    const content = draft.trim();
    setDraft("");
    setSending(true);

    // Optimistic
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      senderName: "You",
      senderImage: null,
      content,
      type: "text",
      attachmentUrl: null,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/alumni/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          content,
          type: "text",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      // Replace optimistic with real
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimistic.id
            ? {
                ...m,
                id: json.data.id,
                createdAt: new Date(json.data.createdAt).toISOString(),
              }
            : m
        )
      );
    } catch (err: any) {
      // Revert
      setMessages((prev) =>
        prev.filter((m) => m.id !== optimistic.id)
      );
      setDraft(content);
      toast.error(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  /* ---------- Render ---------- */
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b px-4 py-3">
        <h3 className="font-medium">{otherUserName || "Conversation"}</h3>
        <p className="text-xs text-muted-foreground">
          {messages.length} messages
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No messages yet. Say hi!
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m, i) => {
            const isMine = m.senderId === currentUserId;
            const prevMsg = messages[i - 1];
            const showAvatar =
              !prevMsg || prevMsg.senderId !== m.senderId;

            return (
              <div
                key={m.id}
                className={cn(
                  "flex items-end gap-2",
                  isMine && "flex-row-reverse"
                )}
              >
                {showAvatar ? (
                  <Avatar className="size-7 shrink-0">
                    <AvatarImage src={m.senderImage || undefined} />
                    <AvatarFallback className="text-xs">
                      {m.senderName ? initials(m.senderName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="size-7 shrink-0" />
                )}

                <div
                  className={cn(
                    "flex max-w-[70%] flex-col gap-1",
                    isMine && "items-end"
                  )}
                >
                  {showAvatar && !isMine && (
                    <span className="text-xs text-muted-foreground">
                      {m.senderName || "Unknown"}
                    </span>
                  )}

                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {m.type === "text" && <p>{m.content}</p>}
                    {m.type === "image" && m.attachmentUrl && (
                      <img
                        src={m.attachmentUrl}
                        alt="attachment"
                        className="max-h-60 rounded-md"
                      />
                    )}
                    {m.type === "file" && m.attachmentUrl && (
                      <a
                        href={m.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 underline"
                      >
                        <Download className="size-4" />
                        Download file
                      </a>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {format(new Date(m.createdAt), "dd MMM, HH:mm")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compose */}
      <form
        onSubmit={handleSend}
        className="shrink-0 border-t p-3"
      >
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !draft.trim()}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}