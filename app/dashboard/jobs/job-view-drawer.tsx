"use client";

import { format } from "date-fns";
import {
  MapPin,
  Briefcase,
  Clock,
  Check,
  Loader2,
  Wifi,
  ExternalLink,
  Building2,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Job,
  JOB_TYPE_LABELS,
  JOB_EXPERIENCE_LABELS,
  APPLICATION_STATUS_LABELS,
  formatSalary,
} from "./job-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function JobViewDrawer({
  open,
  onOpenChange,
  job,
  onApply,
  busy,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  job: Job | null;
  onApply: (j: Job) => void;
  busy: boolean;
}) {
  if (!job) return null;

  const isExpired =
    job.expiresAt && new Date(job.expiresAt) < new Date();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] sm:max-w-none flex flex-col p-0 gap-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Job Details</SheetTitle>
          <SheetDescription>{job.title}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Company + title */}
            <div className="flex items-start gap-4">
              <Avatar className="size-14">
                <AvatarImage src={job.companyLogo || undefined} />
                <AvatarFallback>
                  {job.companyName ? initials(job.companyName) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {job.companyName || "Unknown Company"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {JOB_TYPE_LABELS[job.jobType]}
                  </Badge>
                  {job.remote && (
                    <Badge variant="secondary">
                      <Wifi className="mr-1 size-3" />
                      Remote
                    </Badge>
                  )}
                  {job.hasApplied && job.applicationStatus && (
                    <Badge variant="default">
                      <Check className="mr-1 size-3" />
                      {APPLICATION_STATUS_LABELS[job.applicationStatus]}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <Section title="Description">
              <p className="whitespace-pre-wrap text-sm">
                {job.description}
              </p>
            </Section>

            {/* Details */}
            <Section title="Details">
              {job.location && (
                <Row
                  icon={<MapPin className="size-4" />}
                  label="Location"
                  value={job.location}
                />
              )}
              {job.experienceLevel && (
                <Row
                  icon={<Briefcase className="size-4" />}
                  label="Experience"
                  value={JOB_EXPERIENCE_LABELS[job.experienceLevel]}
                />
              )}
              <Row
                icon={<IndianRupee className="size-4" />}
                label="Salary"
                value={formatSalary(job)}
              />
              {job.expiresAt && (
                <Row
                  icon={<Clock className="size-4" />}
                  label="Apply before"
                  value={format(
                    new Date(job.expiresAt),
                    "dd MMM yyyy"
                  )}
                />
              )}
            </Section>

            {/* External URL */}
            {job.applicationUrl && (
              <Section title="External Application">
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Apply on company site
                  <ExternalLink className="size-3" />
                </a>
              </Section>
            )}
          </div>
        </div>

        {/* Footer actions */}
        {!isExpired && (
          <div className="shrink-0 border-t px-6 py-4">
            {job.hasApplied ? (
              <Button variant="outline" className="w-full" disabled>
                <Check className="mr-2 size-4" />
                Already Applied
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => onApply(job)}
                disabled={busy}
              >
                {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                Apply for this Job
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-medium">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-all">{value || "—"}</p>
      </div>
    </div>
  );
}