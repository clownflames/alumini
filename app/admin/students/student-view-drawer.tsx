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
import { Mail, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";
import { Student, STATUS_LABELS } from "./student-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function StudentViewDrawer({
  open,
  onOpenChange,
  student,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: Student | null;
}) {
  if (!student) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[70vh] sm:max-w-none flex flex-col p-0 gap-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>Student Details</SheetTitle>
          <SheetDescription>Full profile of {student.name}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <Avatar className="size-16">
                <AvatarImage src={student.image || undefined} />
                <AvatarFallback>{initials(student.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{student.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {student.email}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    variant={
                      student.status === "active" ? "default" : "destructive"
                    }
                  >
                    {STATUS_LABELS[student.status]}
                  </Badge>
                  {student.emailVerified && (
                    <Badge variant="secondary">Email Verified</Badge>
                  )}
                </div>
              </div>
            </div>

            <Section title="Contact">
              <Row
                icon={<Mail className="size-4" />}
                label="Email"
                value={student.email}
              />
            </Section>

            <Section title="Account">
              <Row label="User ID" value={student.id} />
              <Row
                icon={<Shield className="size-4" />}
                label="Role"
                value={student.role}
              />
              <Row
                icon={<Calendar className="size-4" />}
                label="Joined"
                value={format(new Date(student.createdAt), "dd MMM yyyy")}
              />
              <Row
                label="Last Updated"
                value={format(new Date(student.updatedAt), "dd MMM yyyy")}
              />
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
        <p>{value || "—"}</p>
      </div>
    </div>
  );
}