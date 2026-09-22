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
import { Donation, STATUS_LABELS } from "./donation-types";

function statusVariant(s: Donation["status"]) {
  switch (s) {
    case "completed":
      return "default" as const;
    case "pending":
      return "secondary" as const;
    case "failed":
      return "destructive" as const;
    case "refunded":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

function formatAmount(d: Donation) {
  return `${d.currency} ${d.amount.toLocaleString("en-IN")}`;
}

export function DonationTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Donation[];
  onEdit: (d: Donation) => void;
  onDelete: (d: Donation) => void;
}) {
  if (!data.length) {
    return (
      <div className="rounded-md border">
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          No donations found.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>College</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((d) => (
            <TableRow key={d.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {d.donorName || "Anonymous"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {d.donorEmail || "—"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{formatAmount(d)}</span>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(d.status)}>
                  {STATUS_LABELS[d.status]}
                </Badge>
              </TableCell>
              <TableCell>{d.collegeName || "—"}</TableCell>
              <TableCell>{d.paymentProvider || "—"}</TableCell>
              <TableCell>
                {format(new Date(d.createdAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(d)}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(d)}
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