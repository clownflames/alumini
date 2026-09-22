"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
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
  }
}

export function VerificationDetailsDialog({
  open,
  onOpenChange,
  request,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  request: VerificationRequest | null;
}) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {request.fullName}
            <Badge variant={statusVariant(request.status)}>
              {STATUS_LABELS[request.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Submitted {format(new Date(request.createdAt), "dd MMM yyyy, HH:mm")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" value={request.userEmail} />
            <Field label="Roll Number" value={request.rollNumber} />
            <Field label="College" value={request.collegeName} />
            <Field label="Department" value={request.departmentName} />
            <Field
              label="Graduation Year"
              value={request.graduationYear?.toString()}
            />
            <Field label="User ID" value={request.userId} />
          </div>

          {request.additionalInfo && (
            <div>
              <p className="text-xs text-muted-foreground">
                Additional Info
              </p>
              <p className="mt-1 whitespace-pre-wrap">
                {request.additionalInfo}
              </p>
            </div>
          )}

          {request.documentUrl && (
            <div>
              <p className="text-xs text-muted-foreground">Document</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() =>
                  window.open(request.documentUrl!, "_blank")
                }
              >
                <ExternalLink className="mr-2 size-4" />
                Open Document
              </Button>
            </div>
          )}

          {request.status === "rejected" && request.rejectionReason && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-xs font-medium text-destructive">
                Rejection Reason
              </p>
              <p className="mt-1 text-sm">{request.rejectionReason}</p>
            </div>
          )}

          {request.reviewedAt && (
            <div>
              <p className="text-xs text-muted-foreground">Reviewed</p>
              <p className="mt-1">
                {format(
                  new Date(request.reviewedAt),
                  "dd MMM yyyy, HH:mm"
                )}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1">{value || "—"}</p>
    </div>
  );
}