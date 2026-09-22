"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DonationTable } from "./donation-table";
import { DonationDrawer, type DonationFormValues } from "./donation-drawer";
import { DonationConfirmDialog } from "./donation-dialog";
import type { College, Donation } from "./donation-types";
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

export function DonationsClient({
  initialDonations,
  colleges,
}: {
  initialDonations: Donation[];
  colleges: College[];
}) {
  const [donations, setDonations] = useState(initialDonations);
  const [query, setQuery] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Donation | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<DonationFormValues | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Donation | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreate = () => {
    setDrawerMode("create");
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (d: Donation) => {
    setDrawerMode("edit");
    setEditing(d);
    setDrawerOpen(true);
  };

  const handleDrawerSubmit = (values: DonationFormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const refetch = async () => {
    const res = await fetch("/api/admin/donation");
    const json = await res.json();
    if (json.success) setDonations(json.data);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    setSubmitting(true);

    try {
      if (drawerMode === "create") {
        const res = await fetch("/api/admin/donation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Donation recorded");
      } else if (editing) {
        const res = await fetch(`/api/admin/donation/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Donation updated");
      }

      setConfirmOpen(false);
      setDrawerOpen(false);
      setPendingValues(null);
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (d: Donation) => setDeleteTarget(d);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/donation/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setDonations((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success("Donation deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = query
    ? donations.filter(
        (d) =>
          (d.donorName || "").toLowerCase().includes(query.toLowerCase()) ||
          (d.donorEmail || "").toLowerCase().includes(query.toLowerCase()) ||
          (d.paymentId || "").toLowerCase().includes(query.toLowerCase())
      )
    : donations;

  const totalCompleted = donations
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => sum + d.amount, 0);

  const pendingCount = donations.filter(
    (d) => d.status === "pending"
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Donations</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage donations from alumni.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Add Donation
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border p-4">
          <p className="text-xs text-muted-foreground">Total Received</p>
          <p className="mt-1 text-2xl font-semibold">
            ₹ {totalCompleted.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-xs text-muted-foreground">Total Donations</p>
          <p className="mt-1 text-2xl font-semibold">{donations.length}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="mt-1 text-2xl font-semibold">{pendingCount}</p>
        </div>
      </div>

      <Input
        placeholder="Search by donor, email or payment ID..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      <DonationTable
        data={filtered}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <DonationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        donation={editing}
        colleges={colleges}
        submitting={submitting}
        onSubmit={handleDrawerSubmit}
      />

      <DonationConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={submitting}
        mode={drawerMode}
        onConfirm={handleConfirm}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this donation record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The donation record will be
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