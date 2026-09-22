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
import {
  Event,
  EVENT_STATUS_LABELS,
  EVENT_TYPE_LABELS,
} from "./event-types";

function statusVariant(status: Event["status"]) {
  switch (status) {
    case "published":
      return "default" as const;
    case "draft":
      return "secondary" as const;
    case "cancelled":
      return "destructive" as const;
    case "completed":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

export function EventTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Event[];
  onEdit: (e: Event) => void;
  onDelete: (e: Event) => void;
}) {
  if (!data.length) {
    return (
      <div className="rounded-md border">
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          No events found.
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
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>College</TableHead>
            <TableHead>Starts</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((evt) => (
            <TableRow key={evt.id}>
              <TableCell>
                <span className="font-medium">{evt.title}</span>
              </TableCell>
              <TableCell>{EVENT_TYPE_LABELS[evt.eventType]}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(evt.status)}>
                  {EVENT_STATUS_LABELS[evt.status]}
                </Badge>
              </TableCell>
              <TableCell>{evt.collegeName || "—"}</TableCell>
              <TableCell>
                {format(new Date(evt.startAt), "dd MMM yyyy, HH:mm")}
              </TableCell>
              <TableCell>
                <span className="line-clamp-1 text-muted-foreground">
                  {evt.location || evt.meetingUrl || "—"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(evt)}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(evt)}
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