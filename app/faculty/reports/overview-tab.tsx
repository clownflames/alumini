"use client";

import {
  Users,
  GraduationCap,
  UserCog,
  BadgeCheck,
  Heart,
  Briefcase,
  Calendar,
  Heart as HeartIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ReportsData } from "./reports-client";

function formatCurrency(n: number) {
  return `₹ ${n.toLocaleString("en-IN")}`;
}

export function OverviewTab({ reports }: { reports: ReportsData }) {
  const cards = [
    {
      label: "Students",
      value: reports.overview.students.toLocaleString(),
      icon: Users,
    },
    {
      label: "Alumni",
      value: reports.overview.alumni.toLocaleString(),
      icon: GraduationCap,
    },
    {
      label: "Faculty",
      value: reports.overview.faculty.toLocaleString(),
      icon: UserCog,
    },
    {
      label: "Verified Alumni",
      value: reports.overview.verifiedAlumni.toLocaleString(),
      icon: BadgeCheck,
    },
    {
      label: "Mentors",
      value: reports.overview.mentors.toLocaleString(),
      icon: Heart,
    },
    {
      label: "Open to Work",
      value: reports.overview.openToWork.toLocaleString(),
      icon: Briefcase,
    },
    {
      label: "Events",
      value: reports.events.total.toLocaleString(),
      icon: Calendar,
    },
    {
      label: "Jobs Posted",
      value: reports.jobs.total.toLocaleString(),
      icon: Briefcase,
    },
    {
      label: "Applications",
      value: reports.jobs.applications.toLocaleString(),
      icon: Briefcase,
    },
    {
      label: "Donations Received",
      value: formatCurrency(reports.donations.total),
      subtitle: `${reports.donations.count} contributions`,
      icon: HeartIcon,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label}>
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-xl font-semibold">{c.value}</p>
                {c.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {c.subtitle}
                  </p>
                )}
              </div>
              <div className="rounded-md bg-muted p-2">
                <Icon className="size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}