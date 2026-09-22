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
import {
  MoreHorizontal,
  Eye,
  Check,
  X,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  VerificationRequest,
  STATUS_LABELS,
} from "./verification-types";

function statusVariant(s: VerificationRequest["status"]) {
  switch (s) {
    case "approved":
      return "default" as const;
    case "pending":
      return "secondary" as const;
    case "rejected":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export function VerificationTable({
  data,
  onView,
  onApprove,
  onReject,
  onDelete,
}: {
  data: VerificationRequest[];
  onView: (r: VerificationRequest) => void;
  onApprove: (r: VerificationRequest) => void;
  onReject: (r: VerificationRequest) => void;
  onDelete: (r: VerificationRequest) => void;
}) {
  if (!data.length) {
    return (
      <div className="rounded-md border">
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          No verification requests found.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>College</TableHead>
            <TableHead>Dept</TableHead>
            <TableHead>Grad. Year</TableHead>
            <TableHead>Roll No.</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{r.fullName}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.userEmail || "—"}
                  </span>
                </div>
              </TableCell>
              <TableCell>{r.collegeName || "—"}</TableCell>
              <TableCell>{r.departmentName || "—"}</TableCell>
              <TableCell>{r.graduationYear || "—"}</TableCell>
              <TableCell>{r.rollNumber || "—"}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(r.status)}>
                  {STATUS_LABELS[r.status]}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(r.createdAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(r)}>
                      <Eye className="mr-2 size-4" />
                      View details
                    </DropdownMenuItem>

                    {r.documentUrl && (
                      <DropdownMenuItem
                        onClick={() =>
                          window.open(r.documentUrl!, "_blank")
                        }
                      >
                        <ExternalLink className="mr-2 size-4" />
                        Open document
                      </DropdownMenuItem>
                    )}

                    {r.status === "pending" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onApprove(r)}>
                          <Check className="mr-2 size-4 text-green-600" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReject(r)}>
                          <X className="mr-2 size-4 text-destructive" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}

                    {r.status === "rejected" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onApprove(r)}>
                          <Check className="mr-2 size-4 text-green-600" />
                          Approve anyway
                        </DropdownMenuItem>
                      </>
                    )}

                    {r.status === "approved" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onReject(r)}>
                          <X className="mr-2 size-4 text-destructive" />
                          Revoke
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(r)}
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