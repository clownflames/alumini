"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, Briefcase, MapPin, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { Alumni, STATUS_LABELS } from "./alumni-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AlumniViewDrawer({
  open,
  onOpenChange,
  alumni,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  alumni: Alumni | null;
}) {
  if (!alumni) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] sm:max-w-none overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Alumni Details</SheetTitle>
          <SheetDescription>Full profile of {alumni.name}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 py-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <Avatar className="size-16">
              <AvatarImage src={alumni.image || undefined} />
              <AvatarFallback>{initials(alumni.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{alumni.name}</h3>
                {alumni.isVerified && (
                  <BadgeCheck className="size-5 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {alumni.headline || "No headline"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={alumni.status === "active" ? "default" : "destructive"}>
                  {STATUS_LABELS[alumni.status]}
                </Badge>
                {alumni.isMentor && <Badge variant="secondary">Mentor</Badge>}
                {alumni.isOpenToWork && (
                  <Badge variant="secondary">Open to work</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <Section title="Contact">
            <Row icon={<Mail className="size-4" />} label="Email" value={alumni.email} />
            <Row icon={<Phone className="size-4" />} label="Phone" value={alumni.phone} />
            <Row
              icon={<MapPin className="size-4" />}
              label="Location"
              value={[alumni.city, alumni.state, alumni.country]
                .filter(Boolean)
                .join(", ")}
            />
          </Section>

          {/* Education */}
          <Section title="Education">
            <Row label="College" value={alumni.collegeName} />
            <Row label="Department" value={alumni.departmentName} />
            <Row
              label="Batch Year"
              value={alumni.batchYear?.toString()}
            />
            <Row
              label="Graduation Year"
              value={alumni.graduationYear?.toString()}
            />
          </Section>

          {/* Career */}
          <Section title="Career">
            <Row
              icon={<Briefcase className="size-4" />}
              label="Current Role"
              value={alumni.currentJobTitle}
            />
          </Section>

          {/* Bio */}
          {alumni.bio && (
            <Section title="Bio">
              <p className="whitespace-pre-wrap text-sm">{alumni.bio}</p>
            </Section>
          )}

          {/* Meta */}
          <Section title="Meta">
            <Row
              label="Profile Completed"
              value={alumni.profileCompleted ? "Yes" : "No"}
            />
            <Row
              label="Email Verified"
              value={alumni.emailVerified ? "Yes" : "No"}
            />
            <Row
              label="Joined"
              value={format(new Date(alumni.createdAt), "dd MMM yyyy")}
            />
            <Row label="User ID" value={alumni.id} />
          </Section>
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
        <p>{value || "—"}</p>
      </div>
    </div>
  );
}