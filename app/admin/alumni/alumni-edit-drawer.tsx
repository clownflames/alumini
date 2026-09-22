"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import type {
  Alumni,
  AlumniStatus,
  Batch,
  College,
  Department,
} from "./alumni-types";

export type AlumniFormValues = {
  name: string;
  status: AlumniStatus;

  firstName: string;
  lastName: string;
  headline: string;
  bio: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  currentJobTitle: string;
  graduationYear: string;

  collegeId: string;
  departmentId: string;
  batchId: string;

  isVerified: boolean;
  isOpenToWork: boolean;
  isMentor: boolean;
};

const EMPTY: AlumniFormValues = {
  name: "",
  status: "active",
  firstName: "",
  lastName: "",
  headline: "",
  bio: "",
  phone: "",
  city: "",
  state: "",
  country: "",
  currentJobTitle: "",
  graduationYear: "",
  collegeId: "",
  departmentId: "",
  batchId: "",
  isVerified: false,
  isOpenToWork: false,
  isMentor: false,
};

export function AlumniEditDrawer({
  open,
  onOpenChange,
  alumni,
  colleges,
  departments,
  batches,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  alumni: Alumni | null;
  colleges: College[];
  departments: Department[];
  batches: Batch[];
  submitting: boolean;
  onSubmit: (values: AlumniFormValues) => void;
}) {
  const [values, setValues] = useState<AlumniFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (alumni) {
      setValues({
        name: alumni.name ?? "",
        status: alumni.status,
        firstName: alumni.firstName ?? "",
        lastName: alumni.lastName ?? "",
        headline: alumni.headline ?? "",
        bio: alumni.bio ?? "",
        phone: alumni.phone ?? "",
        city: alumni.city ?? "",
        state: alumni.state ?? "",
        country: alumni.country ?? "",
        currentJobTitle: alumni.currentJobTitle ?? "",
        graduationYear:
          alumni.graduationYear != null
            ? String(alumni.graduationYear)
            : "",
        collegeId: alumni.collegeId ?? "",
        departmentId: alumni.departmentId ?? "",
        batchId: alumni.batchId ?? "",
        isVerified: !!alumni.isVerified,
        isOpenToWork: !!alumni.isOpenToWork,
        isMentor: !!alumni.isMentor,
      });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
  }, [open, alumni]);

  const set = <K extends keyof AlumniFormValues>(
    key: K,
    v: AlumniFormValues[K]
  ) => setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = "Name is required";
    if (
      values.graduationYear &&
      (Number(values.graduationYear) < 1900 ||
        Number(values.graduationYear) > 2100)
    ) {
      errs.graduationYear = "Year must be between 1900 and 2100";
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
        className="h-[90vh] sm:max-w-none flex flex-col p-0 gap-0"
      >
        {/* Fixed header */}
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Edit Alumni</SheetTitle>
          <SheetDescription>
            Update user and profile information.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable form body */}
        <form
          id="alumni-edit-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="space-y-6">
            {/* Account */}
            <section className="space-y-4">
              <h4 className="text-sm font-medium">Account</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={values.status}
                    onValueChange={(v) => set("status", (v ?? "active") as AlumniStatus)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Personal */}
            <section className="space-y-4">
              <h4 className="text-sm font-medium">Personal</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={values.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={values.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={values.headline}
                  onChange={(e) => set("headline", e.target.value)}
                  placeholder="Software Engineer at Google"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={values.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={values.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currentJobTitle">Current Job Title</Label>
                  <Input
                    id="currentJobTitle"
                    value={values.currentJobTitle}
                    onChange={(e) => set("currentJobTitle", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
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
              </div>
            </section>

            {/* Education */}
            <section className="space-y-4">
              <h4 className="text-sm font-medium">Education</h4>
              <div className="grid gap-4 md:grid-cols-2">
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

                <div className="grid gap-2">
                  <Label htmlFor="departmentId">Department</Label>
                  <Select
                    value={values.departmentId || "none"}
                    onValueChange={(v) =>
                      set("departmentId", v === "none" || v === null ? "" : v)
                    }
                  >
                    <SelectTrigger id="departmentId">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="batchId">Batch</Label>
                  <Select
                    value={values.batchId || "none"}
                    onValueChange={(v) =>
                      set("batchId", v === "none" || v === null ? "" : v)
                    }
                  >
                    <SelectTrigger id="batchId">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {batches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    min={1900}
                    max={2100}
                    value={values.graduationYear}
                    onChange={(e) => set("graduationYear", e.target.value)}
                  />
                  {errors.graduationYear && (
                    <p className="text-xs text-destructive">
                      {errors.graduationYear}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Flags */}
            <section className="space-y-4">
              <h4 className="text-sm font-medium">Flags</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <ToggleRow
                  label="Verified"
                  checked={values.isVerified}
                  onChange={(v) => set("isVerified", v)}
                />
                <ToggleRow
                  label="Open to work"
                  checked={values.isOpenToWork}
                  onChange={(v) => set("isOpenToWork", v)}
                />
                <ToggleRow
                  label="Mentor"
                  checked={values.isMentor}
                  onChange={(v) => set("isMentor", v)}
                />
              </div>
            </section>
          </div>
        </form>

        {/* Fixed footer */}
        <SheetFooter className="shrink-0 border-t px-6 py-4 flex-row justify-end gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="alumni-edit-form"
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      <Switch checked={checked} onCheckedChange={onChange} />
      <Label className="cursor-pointer">{label}</Label>
    </div>
  );
}