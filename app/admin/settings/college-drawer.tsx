"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { College } from "./college-columns";

export type CollegeFormValues = {
  name: string;
  shortName: string;
  description: string;
  website: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

const EMPTY: CollegeFormValues = {
  name: "",
  shortName: "",
  description: "",
  website: "",
  logo: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
};

export function CollegeDrawer({
  open,
  onOpenChange,
  mode,
  college,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  college: College | null;
  submitting: boolean;
  onSubmit: (values: CollegeFormValues) => void;
}) {
  const [values, setValues] = useState<CollegeFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && college) {
      setValues({
        name: college.name ?? "",
        shortName: college.shortName ?? "",
        description: college.description ?? "",
        website: college.website ?? "",
        logo: college.logo ?? "",
        email: college.email ?? "",
        phone: college.phone ?? "",
        address: college.address ?? "",
        city: college.city ?? "",
        state: college.state ?? "",
        country: college.country ?? "India",
        postalCode: college.postalCode ?? "",
      });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
  }, [open, mode, college]);

  const set = (key: keyof CollegeFormValues, v: string) =>
    setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = "Name is required";
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email))
      errs.email = "Invalid email";
    if (values.website && !/^https?:\/\/.+/.test(values.website))
      errs.website = "Website must start with http:// or https://";
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
        className="h-[90vh] sm:max-w-none"
      >
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Create College" : "Edit College"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a new college to the platform."
              : "Update college details below."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
        >
          {/* Basic info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Indian Institute of Technology"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="shortName">Short Name</Label>
              <Input
                id="shortName"
                value={values.shortName}
                onChange={(e) => set("shortName", e.target.value)}
                placeholder="IIT"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description..."
              rows={3}
            />
          </div>

          {/* Contact */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="contact@college.edu"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={values.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://college.edu"
              />
              {errors.website && (
                <p className="text-xs text-destructive">{errors.website}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={values.logo}
                onChange={(e) => set("logo", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={values.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Street address"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={values.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={values.state}
                onChange={(e) => set("state", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={values.country}
                onChange={(e) => set("country", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={values.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
              />
            </div>
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