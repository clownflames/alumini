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
import type { Batch } from "./batch-types";

export function BatchTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Batch[];
  onEdit: (b: Batch) => void;
  onDelete: (b: Batch) => void;
}) {
  if (!data.length) {
    return (
      <div className="rounded-md border">
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          No batches found.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Batch Year</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>College</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((batch) => (
            <TableRow key={batch.id}>
              <TableCell>
                <Badge variant="secondary">{batch.year}</Badge>
              </TableCell>
              <TableCell>
                {batch.startYear && batch.endYear
                  ? `${batch.startYear} – ${batch.endYear}`
                  : batch.startYear
                    ? `From ${batch.startYear}`
                    : batch.endYear
                      ? `Till ${batch.endYear}`
                      : "—"}
              </TableCell>
              <TableCell>{batch.collegeName || "—"}</TableCell>
              <TableCell>
                {format(new Date(batch.createdAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(batch)}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(batch)}
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