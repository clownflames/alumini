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
  Company,
  Job,
  JobExperience,
  JobType,
} from "./job-types";

export type JobFormValues = {
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  location: string;
  remote: boolean;
  jobType: JobType;
  experienceLevel: JobExperience | "";
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  applicationUrl: string;
  expiresAt: string; // date input
};

const EMPTY: JobFormValues = {
  title: "",
  description: "",
  companyId: "",
  companyName: "",
  location: "",
  remote: false,
  jobType: "full_time",
  experienceLevel: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "INR",
  applicationUrl: "",
  expiresAt: "",
};

function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function JobDrawer({
  open,
  onOpenChange,
  mode,
  job,
  companies,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  job: Job | null;
  companies: Company[];
  submitting: boolean;
  onSubmit: (values: JobFormValues) => void;
}) {
  const [values, setValues] = useState<JobFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useNewCompany, setUseNewCompany] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && job) {
      setValues({
        title: job.title ?? "",
        description: job.description ?? "",
        companyId: job.companyId ?? "",
        companyName: "",
        location: job.location ?? "",
        remote: !!job.remote,
        jobType: job.jobType,
        experienceLevel: job.experienceLevel ?? "",
        salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
        salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
        salaryCurrency: job.salaryCurrency ?? "INR",
        applicationUrl: job.applicationUrl ?? "",
        expiresAt: isoToDateInput(job.expiresAt),
      });
      setUseNewCompany(false);
    } else {
      setValues(EMPTY);
      setUseNewCompany(false);
    }
    setErrors({});
  }, [open, mode, job]);

  const set = <K extends keyof JobFormValues>(
    key: K,
    v: JobFormValues[K]
  ) => setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.title.trim()) errs.title = "Title is required";
    if (!values.description.trim()) errs.description = "Description is required";
    if (useNewCompany && !values.companyName.trim())
      errs.companyName = "Company name is required";
    if (
      values.salaryMin &&
      values.salaryMax &&
      Number(values.salaryMin) > Number(values.salaryMax)
    ) {
      errs.salaryMax = "Max must be greater than min";
    }
    if (values.applicationUrl && !/^https?:\/\/.+/.test(values.applicationUrl))
      errs.applicationUrl = "Must be a valid URL (http/https)";
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
            {mode === "create" ? "Create Job" : "Edit Job"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Post a new job or internship."
              : "Update job details below."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Senior Software Engineer"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Role, responsibilities, requirements..."
              rows={5}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Company</Label>
              {mode === "create" && (
                <button
                  type="button"
                  onClick={() => {
                    setUseNewCompany((v) => !v);
                    set("companyId", "");
                    set("companyName", "");
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  {useNewCompany ? "Choose existing" : "+ Add new company"}
                </button>
              )}
            </div>

            {!useNewCompany ? (
              <Select
                value={values.companyId || "none"}
                onValueChange={(v) =>
                  set("companyId", v === "none" || v === null ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={values.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                placeholder="Company name"
              />
            )}
            {errors.companyName && (
              <p className="text-xs text-destructive">{errors.companyName}</p>
            )}
          </div>

          {/* Type + Experience */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Select
                value={values.jobType}
                onValueChange={(v) => set("jobType", v as JobType)}
              >
                <SelectTrigger id="jobType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select
                value={values.experienceLevel || "none"}
                onValueChange={(v) =>
                  set(
                    "experienceLevel",
                    v === "none" || v === null ? "" : (v as JobExperience)
                  )
                }
              >
                <SelectTrigger id="experienceLevel">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location + Remote */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={values.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Bangalore, India"
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-3 rounded-md border p-3 w-full">
                <Switch
                  id="remote"
                  checked={values.remote}
                  onCheckedChange={(v) => set("remote", v)}
                />
                <Label htmlFor="remote" className="cursor-pointer">
                  Remote position
                </Label>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="salaryCurrency">Currency</Label>
              <Select
                value={values.salaryCurrency}
                onValueChange={(v) => set("salaryCurrency", v ?? "INR")}
              >
                <SelectTrigger id="salaryCurrency">
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
            <div className="grid gap-2">
              <Label htmlFor="salaryMin">Min Salary</Label>
              <Input
                id="salaryMin"
                type="number"
                min={0}
                value={values.salaryMin}
                onChange={(e) => set("salaryMin", e.target.value)}
                placeholder="500000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salaryMax">Max Salary</Label>
              <Input
                id="salaryMax"
                type="number"
                min={0}
                value={values.salaryMax}
                onChange={(e) => set("salaryMax", e.target.value)}
                placeholder="1500000"
              />
              {errors.salaryMax && (
                <p className="text-xs text-destructive">{errors.salaryMax}</p>
              )}
            </div>
          </div>

          {/* App URL + Expiry */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="applicationUrl">Application URL</Label>
              <Input
                id="applicationUrl"
                value={values.applicationUrl}
                onChange={(e) => set("applicationUrl", e.target.value)}
                placeholder="https://company.com/careers/apply"
              />
              {errors.applicationUrl && (
                <p className="text-xs text-destructive">
                  {errors.applicationUrl}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Expires On</Label>
              <Input
                id="expiresAt"
                type="date"
                value={values.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
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