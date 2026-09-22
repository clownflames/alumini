"use client";

import { format } from "date-fns";
import {
  MapPin,
  Briefcase,
  Wifi,
  Building2,
  Clock,
  Trash2,
  Eye,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Application,
  STATUS_LABELS,
  JOB_TYPE_LABELS,
  JOB_EXPERIENCE_LABELS,
  formatSalary,
} from "./application-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function statusVariant(status: Application["status"]) {
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

export function ApplicationCard({
  application,
  onView,
  onWithdraw,
  busy,
}: {
  application: Application;
  onView: (a: Application) => void;
  onWithdraw: (a: Application) => void;
  busy: boolean;
}) {
  const canWithdraw = application.status === "applied";

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Company + Job Title */}
        <div className="flex items-start gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={application.companyLogo || undefined} />
            <AvatarFallback>
              {application.companyName
                ? initials(application.companyName)
                : "?"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-medium">
              {application.jobTitle}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {application.companyName || "Unknown Company"}
            </p>
          </div>

          <Badge variant={statusVariant(application.status)}>
            {STATUS_LABELS[application.status]}
          </Badge>
        </div>

        {/* Meta */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {application.jobLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{application.jobLocation}</span>
            </div>
          )}
          {application.jobRemote && (
            <div className="flex items-center gap-2">
              <Wifi className="size-3.5 shrink-0" />
              <span>Remote</span>
            </div>
          )}
          {application.jobExperienceLevel && (
            <div className="flex items-center gap-2">
              <Briefcase className="size-3.5 shrink-0" />
              <span>
                {JOB_EXPERIENCE_LABELS[application.jobExperienceLevel]}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 shrink-0" />
            <span>
              Applied{" "}
              {format(new Date(application.createdAt), "dd MMM yyyy")}
            </span>
          </div>
        </div>

        {/* Type + Salary */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {JOB_TYPE_LABELS[application.jobType]}
          </Badge>
          <span className="text-xs font-medium">
            {formatSalary(application)}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(application)}
          >
            <Eye className="mr-1.5 size-3.5" />
            View
          </Button>

          {canWithdraw ? (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={() => onWithdraw(application)}
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Trash2 className="mr-1.5 size-3.5" />
              )}
              Withdraw
            </Button>
          ) : (
            <Button size="sm" variant="secondary" className="flex-1" disabled>
              <Check className="mr-1.5 size-3.5" />
              {STATUS_LABELS[application.status]}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}