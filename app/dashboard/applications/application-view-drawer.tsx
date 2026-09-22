"use client";

import { format } from "date-fns";
import {
  MapPin,
  Briefcase,
  Wifi,
  ExternalLink,
  Calendar,
  IndianRupee,
  Building2,
  FileText,
} from "lucide-react";
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

export function ApplicationViewDrawer({
  open,
  onOpenChange,
  application,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  application: Application | null;
}) {
  if (!application) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] sm:max-w-none flex flex-col p-0 gap-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Application Details</SheetTitle>
          <SheetDescription>{application.jobTitle}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <Avatar className="size-14">
                <AvatarImage src={application.companyLogo || undefined} />
                <AvatarFallback>
                  {application.companyName
                    ? initials(application.companyName)
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {application.jobTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {application.companyName || "Unknown Company"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={statusVariant(application.status)}>
                    {STATUS_LABELS[application.status]}
                  </Badge>
                  <Badge variant="secondary">
                    {JOB_TYPE_LABELS[application.jobType]}
                  </Badge>
                  {application.jobRemote && (
                    <Badge variant="secondary">
                      <Wifi className="mr-1 size-3" />
                      Remote
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Job Details */}
            <Section title="Job Details">
              {application.jobLocation && (
                <Row
                  icon={<MapPin className="size-4" />}
                  label="Location"
                  value={application.jobLocation}
                />
              )}
              {application.jobExperienceLevel && (
                <Row
                  icon={<Briefcase className="size-4" />}
                  label="Experience"
                  value={
                    JOB_EXPERIENCE_LABELS[
                      application.jobExperienceLevel
                    ]
                  }
                />
              )}
              <Row
                icon={<IndianRupee className="size-4" />}
                label="Salary"
                value={formatSalary(application)}
              />
            </Section>

            {/* Application Info */}
            <Section title="Application">
              <Row
                icon={<Calendar className="size-4" />}
                label="Applied on"
                value={format(
                  new Date(application.createdAt),
                  "dd MMM yyyy, HH:mm"
                )}
              />
              {application.updatedAt !== application.createdAt && (
                <Row
                  label="Last updated"
                  value={format(
                    new Date(application.updatedAt),
                    "dd MMM yyyy, HH:mm"
                  )}
                />
              )}
              {application.resumeUrl && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 text-muted-foreground">
                    <FileText className="size-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      Resume
                    </p>
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      View Resume
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              )}
            </Section>

            {/* Cover Letter */}
            {application.coverLetter && (
              <Section title="Cover Letter">
                <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                  {application.coverLetter}
                </p>
              </Section>
            )}

            {/* Meta */}
            <Section title="Meta">
              <Row label="Application ID" value={application.id} />
              <Row label="Job ID" value={application.jobId} />
            </Section>
          </div>
        </div>
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