"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
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
import type { Batch, College, Department } from "./alumni-types";

export type AlumniCreateFormValues = {
  name: string;
  email: string;
  password: string;

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

const EMPTY: AlumniCreateFormValues = {
  name: "",
  email: "",
  password: "",
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

function generatePassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < 12; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function AlumniCreateDrawer({
  open,
  onOpenChange,
  colleges,
  departments,
  batches,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  colleges: College[];
  departments: Department[];
  batches: Batch[];
  submitting: boolean;
  onSubmit: (values: AlumniCreateFormValues) => void;
}) {
  const [values, setValues] = useState<AlumniCreateFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues({ ...EMPTY, password: generatePassword() });
    setErrors({});
    setShowPassword(false);
  }, [open]);

  const set = <K extends keyof AlumniCreateFormValues>(
    key: K,
    v: AlumniCreateFormValues[K]
  ) => setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs.name = "Name is required";
    if (!values.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(values.email))
      errs.email = "Invalid email format";
    if (!values.password) errs.password = "Password is required";
    else if (values.password.length < 8)
      errs.password = "Minimum 8 characters";
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
          <SheetTitle>Create Alumni Account</SheetTitle>
          <SheetDescription>
            Create a new alumni account with login credentials. The user can
            log in immediately with the password below.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable form */}
        <form
          id="alumni-create-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="space-y-6">
            {/* ============ ACCOUNT ============ */}
            <section className="space-y-4">
              <h4 className="text-sm font-medium">Account</h4>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password *</Label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => set("password", generatePassword())}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <RefreshCw className="size-3" />
                      Regenerate
                    </button>
                  </div>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Minimum 8 characters"
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Share this password with the alumni securely. They can change
                  it later from settings.
                </p>
              </div>
            </section>

            {/* ============ PERSONAL ============ */}
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

            {/* ============ EDUCATION ============ */}
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
                    placeholder="2024"
                  />
                  {errors.graduationYear && (
                    <p className="text-xs text-destructive">
                      {errors.graduationYear}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* ============ FLAGS ============ */}
            <section className="space-y-4">
              <h4 className="text-sm font-medium">Flags</h4>

              <div className="grid gap-3 md:grid-cols-3">
                <ToggleRow
                  label="Verified"
                  description="Mark as verified alumni"
                  checked={values.isVerified}
                  onChange={(v) => set("isVerified", v)}
                />
                <ToggleRow
                  label="Open to work"
                  description="Show in job seekers"
                  checked={values.isOpenToWork}
                  onChange={(v) => set("isOpenToWork", v)}
                />
                <ToggleRow
                  label="Mentor"
                  description="Available for mentorship"
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
            form="alumni-create-form"
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create Account
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      <Switch checked={checked} onCheckedChange={onChange} />
      <div>
        <Label className="cursor-pointer">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}