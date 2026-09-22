"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Post, VISIBILITY_LABELS } from "./post-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function visibilityVariant(v: Post["visibility"]) {
  switch (v) {
    case "public":
      return "default" as const;
    case "connections":
      return "secondary" as const;
    case "private":
      return "outline" as const;
  }
}

export function PostViewDrawer({
  open,
  onOpenChange,
  post,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  post: Post | null;
}) {
  if (!post) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[80vh] sm:max-w-none flex flex-col p-0 gap-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Post Details</SheetTitle>
          <SheetDescription>
            Posted {format(new Date(post.createdAt), "dd MMM yyyy, HH:mm")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Author */}
            <div className="flex items-start gap-3">
              <Avatar className="size-12">
                <AvatarImage src={post.authorImage || undefined} />
                <AvatarFallback>
                  {post.authorName ? initials(post.authorName) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {post.authorName || "Unknown"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {post.authorEmail || "—"}
                </p>
                <div className="mt-2">
                  <Badge variant={visibilityVariant(post.visibility)}>
                    {VISIBILITY_LABELS[post.visibility]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content */}
            <Section title="Content">
              <p className="whitespace-pre-wrap text-sm">{post.content}</p>
            </Section>

            {/* Image */}
            {post.image && (
              <Section title="Image">
                <img
                  src={post.image}
                  alt="Post"
                  className="max-h-96 w-full rounded-md object-cover"
                />
              </Section>
            )}

            {/* Meta */}
            <Section title="Meta">
              <Row label="Post ID" value={post.id} />
              <Row
                icon={<Calendar className="size-4" />}
                label="Posted"
                value={format(
                  new Date(post.createdAt),
                  "dd MMM yyyy, HH:mm"
                )}
              />
              {post.updatedAt !== post.createdAt && (
                <Row
                  label="Last Updated"
                  value={format(
                    new Date(post.updatedAt),
                    "dd MMM yyyy, HH:mm"
                  )}
                />
              )}
            </Section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-medium">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-all">{value || "—"}</p>
      </div>
    </div>
  );
}