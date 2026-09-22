"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { College, Donation, DonationStatus } from "./donation-types";

export type DonationFormValues = {
  amount: string;
  currency: string;
  status: DonationStatus;
  paymentProvider: string;
  paymentId: string;
  message: string;
  collegeId: string;
};

const EMPTY: DonationFormValues = {
  amount: "",
  currency: "INR",
  status: "pending",
  paymentProvider: "",
  paymentId: "",
  message: "",
  collegeId: "",
};

export function DonationDrawer({
  open,
  onOpenChange,
  mode,
  donation,
  colleges,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  donation: Donation | null;
  colleges: College[];
  submitting: boolean;
  onSubmit: (values: DonationFormValues) => void;
}) {
  const [values, setValues] = useState<DonationFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && donation) {
      setValues({
        amount: String(donation.amount ?? ""),
        currency: donation.currency ?? "INR",
        status: donation.status,
        paymentProvider: donation.paymentProvider ?? "",
        paymentId: donation.paymentId ?? "",
        message: donation.message ?? "",
        collegeId: donation.collegeId ?? "",
      });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
  }, [open, mode, donation]);

  const set = <K extends keyof DonationFormValues>(
    key: K,
    v: DonationFormValues[K]
  ) => setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.amount) errs.amount = "Amount is required";
    else {
      const n = Number(values.amount);
      if (isNaN(n) || n <= 0) errs.amount = "Must be a positive number";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[80vh] sm:max-w-none"
      >
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Add Donation" : "Edit Donation"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Record a new donation manually."
              : "Update donation details below."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                value={values.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="5000"
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={values.currency}
                onValueChange={(v) => set("currency", v ?? "INR")}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={values.status}
                onValueChange={(v) => set("status", v as DonationStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="collegeId">College</Label>
              <Select
                value={values.collegeId || "none"}
                onValueChange={(v) =>
                  set("collegeId", v === "none" || v === null ? "" : v)
                }
              >
                <SelectTrigger id="collegeId">
                  <SelectValue placeholder="Select college" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {colleges.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="paymentProvider">Payment Provider</Label>
              <Select
                value={values.paymentProvider || "none"}
                onValueChange={(v) =>
                  set("paymentProvider", v === "none" || v === null ? "" : v)
                }
              >
                <SelectTrigger id="paymentProvider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Manual</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentId">Payment ID</Label>
              <Input
                id="paymentId"
                value={values.paymentId}
                onChange={(e) => set("paymentId", e.target.value)}
                placeholder="pay_xxxxx"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={values.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Optional note from donor..."
              rows={3}
            />
          </div>

          <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}