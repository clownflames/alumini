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
import { MoreHorizontal, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mentorship,
  STATUS_LABELS,
  FOCUS_LABELS,
} from "./mentorship-types";

function statusVariant(s: Mentorship["status"]) {
  switch (s) {
    case "active":
      return "default" as const;
    case "pending":
      return "secondary" as const;
    case "completed":
      return "outline" as const;
    case "cancelled":
      return "destructive" as const;
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

export function MentorshipTable({
  data,
  onView,
}: {
  data: Mentorship[];
  onView: (m: Mentorship) => void;
}) {
  if (!data.length) {
    return (
      <div className="rounded-md border">
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          No mentorships found.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mentor</TableHead>
            <TableHead>Mentee</TableHead>
            <TableHead>Focus</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((m) => (
            <TableRow key={m.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={m.mentorImage || undefined} />
                    <AvatarFallback>
                      {m.mentorName ? initials(m.mentorName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {m.mentorName || "Unknown"}
                    </span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {m.mentorJobTitle || m.mentorEmail || "—"}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={m.menteeImage || undefined} />
                    <AvatarFallback>
                      {m.menteeName ? initials(m.menteeName) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {m.menteeName || "Unknown"}
                    </span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {m.menteeEmail || "—"}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {FOCUS_LABELS[m.focus]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(m.status)}>
                  {STATUS_LABELS[m.status]}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(m.createdAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(m)}>
                      <Eye className="mr-2 size-4" />
                      View details
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