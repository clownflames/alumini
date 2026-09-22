"use client";

import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Briefcase,
  Calendar,
  Heart,
  ShieldCheck,
  Layers,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Stats = {
  alumni: number;
  students: number;
  faculty: number;
  colleges: number;
  departments: number;
  batches: number;
  events: number;
  jobs: number;
  posts: number;
  donationsTotal: number;
  donationsCount: number;
  pendingVerifications: number;
};

function formatCurrency(amount: number) {
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

export function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      title: "Alumni",
      value: stats.alumni.toLocaleString(),
      icon: GraduationCap,
      href: "/admin/alumni",
    },
    {
      title: "Students",
      value: stats.students.toLocaleString(),
      icon: BookOpen,
      href: "/admin/students",
    },
    {
      title: "Faculty",
      value: stats.faculty.toLocaleString(),
      icon: Users,
      href: "/admin/faculty",
    },
    {
      title: "Colleges",
      value: stats.colleges.toLocaleString(),
      icon: Building2,
      href: "/admin/settings",
    },
    {
      title: "Departments",
      value: stats.departments.toLocaleString(),
      icon: Layers,
      href: "/admin/departments",
    },
    {
      title: "Batches",
      value: stats.batches.toLocaleString(),
      icon: Layers,
      href: "/admin/batches",
    },
    {
      title: "Events",
      value: stats.events.toLocaleString(),
      icon: Calendar,
      href: "/admin/events",
    },
    {
      title: "Jobs",
      value: stats.jobs.toLocaleString(),
      icon: Briefcase,
      href: "/admin/jobs",
    },
    {
      title: "Posts",
      value: stats.posts.toLocaleString(),
      icon: FileText,
      href: "/admin/posts",
    },
    {
      title: "Donations",
      value: formatCurrency(stats.donationsTotal),
      subtitle: `${stats.donationsCount} contributions`,
      icon: Heart,
      href: "/admin/donations",
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications.toLocaleString(),
      subtitle:
        stats.pendingVerifications > 0 ? "Needs review" : "All clear",
      icon: ShieldCheck,
      href: "/admin/verifications",
      highlight: stats.pendingVerifications > 0,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Link key={c.title} href={c.href}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{c.title}</p>
                  <p className="text-xl font-semibold">{c.value}</p>
                  {c.subtitle && (
                    <p
                      className={
                        c.highlight
                          ? "text-xs text-destructive"
                          : "text-xs text-muted-foreground"
                      }
                    >
                      {c.subtitle}
                    </p>
                  )}
                </div>
                <div className="rounded-md bg-muted p-2">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}