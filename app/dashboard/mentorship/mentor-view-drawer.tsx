"use client";

import {
  Briefcase,
  MapPin,
  Building2,
  Layers,
  Send,
  Check,
  Clock,
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
import type { AvailableMentor } from "./mentorship-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MentorViewDrawer({
  open,
  onOpenChange,
  mentor,
  onRequest,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mentor: AvailableMentor | null;
  onRequest: (m: AvailableMentor) => void;
}) {
  if (!mentor) return null;

  const hasExisting = !!mentor.existingMentorshipStatus;
  const existingStatus = mentor.existingMentorshipStatus;
  const isSent = mentor.existingMentorshipDirection === "sent";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[80vh] sm:max-w-none flex flex-col p-0 gap-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Mentor Profile</SheetTitle>
          <SheetDescription>{mentor.name}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <Avatar className="size-16">
                <AvatarImage src={mentor.image || undefined} />
                <AvatarFallback>{initials(mentor.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{mentor.name}</h3>
                {mentor.headline && (
                  <p className="text-sm text-muted-foreground">
                    {mentor.headline}
                  </p>
                )}
                <div className="mt-2">
                  <Badge variant="secondary">
                    <Check className="mr-1 size-3" />
                    Available as Mentor
                  </Badge>
                </div>
              </div>
            </div>

            {/* Details */}
            <Section title="Professional">
              {mentor.jobTitle && (
                <Row
                  icon={<Briefcase className="size-4" />}
                  label="Current Role"
                  value={mentor.jobTitle}
                />
              )}
              {mentor.city && (
                <Row
                  icon={<MapPin className="size-4" />}
                  label="Location"
                  value={mentor.city}
                />
              )}
            </Section>

            {(mentor.collegeName || mentor.departmentName) && (
              <Section title="Education">
                {mentor.collegeName && (
                  <Row
                    icon={<Building2 className="size-4" />}
                    label="College"
                    value={mentor.collegeName}
                  />
                )}
                {mentor.departmentName && (
                  <Row
                    icon={<Layers className="size-4" />}
                    label="Department"
                    value={mentor.departmentName}
                  />
                )}
              </Section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-6 py-4">
          {!hasExisting && (
            <Button
              className="w-full"
              onClick={() => onRequest(mentor)}
            >
              <Send className="mr-2 size-4" />
              Request Mentorship
            </Button>
          )}

          {hasExisting && existingStatus === "pending" && isSent && (
            <Button variant="outline" className="w-full" disabled>
              <Clock className="mr-2 size-4" />
              Request Pending
            </Button>
          )}

          {hasExisting && existingStatus === "pending" && !isSent && (
            <Button className="w-full" disabled>
              <Clock className="mr-2 size-4" />
              They requested you
            </Button>
          )}

          {hasExisting && existingStatus === "active" && (
            <Button variant="outline" className="w-full" disabled>
              <Check className="mr-2 size-4" />
              Active Mentorship
            </Button>
          )}

          {hasExisting &&
            (existingStatus === "completed" ||
              existingStatus === "cancelled") && (
              <Button
                className="w-full"
                onClick={() => onRequest(mentor)}
              >
                <Send className="mr-2 size-4" />
                Request Again
              </Button>
            )}
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