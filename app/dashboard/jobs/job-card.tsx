"use client";

import { format } from "date-fns";
import {
  MapPin,
  Briefcase,
  Clock,
  Check,
  Loader2,
  Wifi,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

function statusVariant(status: string) {
  switch (status) {
    case "accepted":
      return "default" as const;
    case "shortlisted":
      return "default" as const;
    case "reviewing":
      return "secondary" as const;
    case "rejected":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export function JobCard({
  job,
  onView,
  onApply,
  busy,
}: {
  job: Job;
  onView: (j: Job) => void;
  onApply: (j: Job) => void;
  busy: boolean;
}) {
  const isExpired =
    job.expiresAt && new Date(job.expiresAt) < new Date();

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Company + Title */}
        <div className="flex items-start gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={job.companyLogo || undefined} />
            <AvatarFallback>
              {job.companyName ? initials(job.companyName) : "?"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-medium">{job.title}</h3>
            <p className="truncate text-xs text-muted-foreground">
              {job.companyName || "Unknown Company"}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
          )}
          {job.remote && (
            <div className="flex items-center gap-2">
              <Wifi className="size-3.5 shrink-0" />
              <span>Remote</span>
            </div>
          )}
          {job.experienceLevel && (
            <div className="flex items-center gap-2">
              <Briefcase className="size-3.5 shrink-0" />
              <span>{JOB_EXPERIENCE_LABELS[job.experienceLevel]}</span>
            </div>
          )}
          {job.expiresAt && !isExpired && (
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 shrink-0" />
              <span>
                Apply by {format(new Date(job.expiresAt), "dd MMM")}
              </span>
            </div>
          )}
        </div>

        {/* Type + Salary */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {JOB_TYPE_LABELS[job.jobType]}
          </Badge>
          <span className="text-xs font-medium">{formatSalary(job)}</span>
        </div>

        {/* Applied badge */}
        {job.hasApplied && job.applicationStatus && (
          <Badge variant={statusVariant(job.applicationStatus)}>
            <Check className="mr-1 size-3" />
            {APPLICATION_STATUS_LABELS[job.applicationStatus]}
          </Badge>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(job)}
          >
            Details
          </Button>

          {job.hasApplied ? (
            <Button size="sm" variant="secondary" className="flex-1" disabled>
              <Check className="mr-1.5 size-3.5" />
              Applied
            </Button>
          ) : isExpired ? (
            <Button size="sm" className="flex-1" disabled>
              Expired
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onApply(job)}
              disabled={busy}
            >
              {busy && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
              Apply Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}