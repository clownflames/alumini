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
import { MoreHorizontal, Eye, Pencil, Trash2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alumni, STATUS_LABELS } from "./alumni-types";

function statusVariant(s: Alumni["status"]) {
  switch (s) {
    case "active":
      return "default" as const;
    case "suspended":
      return "destructive" as const;
    case "pending":
      return "secondary" as const;
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

export function AlumniTable({
  data,
  onView,
  onEdit,
  onDelete,
}: {
  data: Alumni[];
  onView: (a: Alumni) => void;
  onEdit: (a: Alumni) => void;
  onDelete: (a: Alumni) => void;
}) {
  if (!data.length) {
    return (
      <div className="rounded-md border">
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          No alumni found.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alumni</TableHead>
            <TableHead>Headline</TableHead>
            <TableHead>College</TableHead>
            <TableHead>Dept</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={a.image || undefined} />
                    <AvatarFallback>{initials(a.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{a.name}</span>
                      {a.isVerified && (
                        <BadgeCheck className="size-4 text-primary" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {a.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="line-clamp-1 text-sm text-muted-foreground">
                  {a.headline || "—"}
                </span>
              </TableCell>
              <TableCell>{a.collegeName || "—"}</TableCell>
              <TableCell>{a.departmentName || "—"}</TableCell>
              <TableCell>
                {a.batchYear || a.graduationYear || "—"}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(a.status)}>
                  {STATUS_LABELS[a.status]}
                </Badge>
              </TableCell>
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
                    <DropdownMenuItem onClick={() => onEdit(a)}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(a)}
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