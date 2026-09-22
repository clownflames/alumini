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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Department } from "./department-columns";

export function DepartmentTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Department[];
  onEdit: (d: Department) => void;
  onDelete: (d: Department) => void;
}) {
  if (!data.length) {
    return (
      <div className="rounded-md border">
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          No departments found.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>College</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((dept) => (
            <TableRow key={dept.id}>
              <TableCell>
                <span className="font-medium">{dept.name}</span>
              </TableCell>
              <TableCell>{dept.code || "—"}</TableCell>
              <TableCell>{dept.collegeName || "—"}</TableCell>
              <TableCell>
                <span className="line-clamp-1 text-muted-foreground">
                  {dept.description || "—"}
                </span>
              </TableCell>
              <TableCell>
                {format(new Date(dept.createdAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(dept)}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(dept)}
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