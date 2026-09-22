"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Contact } from "./message-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function NewConversationDrawer({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (conversationId: string) => void;
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/alumni/messages/contacts");
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);
        setContacts(json.data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load contacts");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const filtered = contacts.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.headline || "").toLowerCase().includes(q)
    );
  });

  const handleStart = async (contact: Contact) => {
    setCreating(contact.id);
    try {
      const res = await fetch("/api/alumni/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: contact.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      onCreated(json.data.id);
      toast.success(`Conversation with ${contact.name}`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to start conversation");
    } finally {
      setCreating(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[80vh] sm:max-w-none flex flex-col p-0 gap-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>New Conversation</SheetTitle>
          <SheetDescription>
            Choose someone to start a chat with.
          </SheetDescription>
        </SheetHeader>

        <div className="shrink-0 border-b p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 p-4 text-center">
              <UserPlus className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {contacts.length === 0
                  ? "Connect with alumni first to start messaging."
                  : "No matching contacts."}
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => handleStart(c)}
                disabled={creating !== null}
                className="flex w-full items-center gap-3 border-b p-3 text-left transition-colors hover:bg-accent/50 disabled:opacity-50"
              >
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={c.image || undefined} />
                  <AvatarFallback>{initials(c.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.headline || c.email}
                  </p>
                </div>
                {creating === c.id && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
              </button>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}