"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Post, VISIBILITY_LABELS } from "./post-types";

function visibilityVariant(v: Post["visibility"]) {
  switch (v) {
    case "public":
      return "default" as const;
    case "connections":
      return "secondary" as const;
    case "private":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PostTable({
  data,
  currentUserId,
  onView,
  onEdit,
}: {
  data: Post[];
  currentUserId: string;
  onView: (p: Post) => void;
  onEdit: (p: Post) => void;
}) {
  if (!data.length) {
    return (
      <div className="rounded-md border">
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          No posts found.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((post) => {
            const isOwner = post.userId === currentUserId;
            return (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={post.authorImage || undefined} />
                      <AvatarFallback>
                        {post.authorName ? initials(post.authorName) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {post.authorName || "Unknown"}
                        </span>
                        {isOwner && (
                          <span className="text-xs text-primary">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {post.authorEmail || "—"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  <span className="line-clamp-2 text-sm">
                    {post.content}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={visibilityVariant(post.visibility)}>
                    {VISIBILITY_LABELS[post.visibility]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(post.createdAt), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" />}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(post)}>
                        <Eye className="mr-2 size-4" />
                        View details
                      </DropdownMenuItem>
                      {isOwner && (
                        <DropdownMenuItem onClick={() => onEdit(post)}>
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}