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
import { MoreHorizontal, Eye, Pencil, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Announcement,
  PRIORITY_LABELS,
  AUDIENCE_LABELS,
} from "./announcement-types";

function priorityVariant(p: Announcement["priority"]) {
  switch (p) {
    case "urgent":
      return "destructive" as const;
    case "high":
      return "default" as const;
    case "low":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

export function AnnouncementTable({
  data,
  currentUserId,
  onView,
  onEdit,
}: {
  data: Announcement[];
  currentUserId: string;
  onView: (a: Announcement) => void;
  onEdit: (a: Announcement) => void;
}) {
  if (!data.length) {
    return (
      <div className="rounded-md border">
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          No announcements found.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>College</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((a) => {
            const isOwner = a.createdBy === currentUserId;
            return (
              <TableRow key={a.id}>
                <TableCell>
                  <div className="flex items-start gap-2">
                    {a.isPinned && (
                      <Pin
                        className="mt-0.5 size-3.5 shrink-0 text-primary"
                        fill="currentColor"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{a.title}</span>
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {a.content}
                      </span>
                      {isOwner && (
                        <span className="mt-0.5 text-xs text-primary">
                          Your announcement
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={priorityVariant(a.priority)}>
                    {PRIORITY_LABELS[a.priority]}
                  </Badge>
                </TableCell>
                <TableCell>{AUDIENCE_LABELS[a.audience]}</TableCell>
                <TableCell>
                  <Badge variant={a.isPublished ? "default" : "secondary"}>
                    {a.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>{a.collegeName || "—"}</TableCell>
                <TableCell>
                  {format(new Date(a.createdAt), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" />}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(a)}>
                        <Eye className="mr-2 size-4" />
                        View details
                      </DropdownMenuItem>
                      {isOwner && (
                        <DropdownMenuItem onClick={() => onEdit(a)}>
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