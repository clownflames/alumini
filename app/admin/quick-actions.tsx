"use client";

import Link from "next/link";
import {
  UserPlus,
  CalendarPlus,
  BriefcaseBusiness,
  Building2,
  Megaphone,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    label: "Add Alumni",
    href: "/admin/alumni",
    icon: UserPlus,
  },
  {
    label: "Create Event",
    href: "/admin/events",
    icon: CalendarPlus,
  },
  {
    label: "Post Job",
    href: "/admin/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Add College",
    href: "/admin/settings",
    icon: Building2,
  },
  {
    label: "Announcement",
    href: "/admin/announcements",
    icon: Megaphone,
  },
  {
    label: "Review Verifications",
    href: "/admin/verifications",
    icon: ShieldCheck,
  },
];

export function QuickActions() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium">Quick Actions</h2>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Button key={a.label} variant="outline" asChild>
              <Link href={a.href}>
                <Icon className="mr-2 size-4" />
                {a.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}