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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function PostTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Post[];
  onEdit: (p: Post) => void;
  onDelete: (p: Post) => void;
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
          {data.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {post.authorName || "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {post.authorEmail || "—"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-md">
                <span className="line-clamp-2 text-sm">{post.content}</span>
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
                    <DropdownMenuItem onClick={() => onEdit(post)}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(post)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}