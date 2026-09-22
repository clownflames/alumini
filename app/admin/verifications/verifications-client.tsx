"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VerificationTable } from "./verification-table";
import {
  ApproveConfirmDialog,
  RejectConfirmDialog,
} from "./verification-dialog";
import { VerificationDetailsDialog } from "./verification-details-dialog";
import type { College, Department, VerificationRequest } from "./verification-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function VerificationsClient({
  initialRequests,
  colleges,
  departments,
}: {
  initialRequests: VerificationRequest[];
  colleges: College[];
  departments: Department[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  // Approve
  const [approveTarget, setApproveTarget] =
    useState<VerificationRequest | null>(null);

  // Reject
  const [rejectTarget, setRejectTarget] =
    useState<VerificationRequest | null>(null);

  // Details
  const [detailsTarget, setDetailsTarget] =
    useState<VerificationRequest | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] =
    useState<VerificationRequest | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const refetch = async () => {
    const res = await fetch("/api/admin/verification");
    const json = await res.json();
    if (json.success) setRequests(json.data);
  };

  /* ---------- Approve ---------- */
  const confirmApprove = async () => {
    if (!approveTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/verification/${approveTarget.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      await refetch();
      toast.success("Verification approved");
      setApproveTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Reject ---------- */
  const confirmReject = async (reason: string) => {
    if (!rejectTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/verification/${rejectTarget.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "rejected",
            rejectionReason: reason,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      await refetch();
      toast.success("Verification rejected");
      setRejectTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Rejection failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Delete ---------- */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/verification/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setRequests((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success("Request deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (
      query &&
      !(
        r.fullName.toLowerCase().includes(query.toLowerCase()) ||
        (r.userEmail || "").toLowerCase().includes(query.toLowerCase()) ||
        (r.rollNumber || "").toLowerCase().includes(query.toLowerCase())
      )
    ) {
      return false;
    }
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Verifications</h1>
        <p className="text-sm text-muted-foreground">
          Review alumni verification requests.
          {pendingCount > 0 && (
            <span className="ml-2 font-medium text-primary">
              ({pendingCount} pending)
            </span>
          )}
        </p>
      </div>

      {/* Status tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as any)}
      >
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <Input
        placeholder="Search by name, email or roll number..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      <VerificationTable
        data={filtered}
        onView={(r) => setDetailsTarget(r)}
        onApprove={(r) => setApproveTarget(r)}
        onReject={(r) => setRejectTarget(r)}
        onDelete={(r) => setDeleteTarget(r)}
      />

      {/* Approve dialog */}
      <ApproveConfirmDialog
        open={!!approveTarget}
        onOpenChange={(v) => !v && setApproveTarget(null)}
        loading={submitting}
        applicantName={approveTarget?.fullName || ""}
        onConfirm={confirmApprove}
      />

      {/* Reject dialog */}
      <RejectConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(v) => !v && setRejectTarget(null)}
        loading={submitting}
        applicantName={rejectTarget?.fullName || ""}
        onConfirm={confirmReject}
      />

      {/* Details dialog */}
      <VerificationDetailsDialog
        open={!!detailsTarget}
        onOpenChange={(v) => !v && setDetailsTarget(null)}
        request={detailsTarget}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete request from {deleteTarget?.fullName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The verification request will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}