"use client";

import Link from "next/link";
import { format } from "date-fns";
import { GraduationCap, Calendar, Heart, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Alumni = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
};

type Event = {
  id: string;
  title: string;
  startAt: string;
  status: string;
  location: string | null;
};

type Donation = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  donorName: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function RecentSection({
  recentAlumni,
  recentEvents,
  recentDonations,
}: {
  recentAlumni: Alumni[];
  recentEvents: Event[];
  recentDonations: Donation[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Recent Alumni */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="size-4" />
            Recent Alumni
          </CardTitle>
          <Link
            href="/admin/alumni"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            View all
            <ArrowRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAlumni.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No alumni yet.
            </p>
          )}
          {recentAlumni.map((a) => (
            <div key={a.id} className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={a.image || undefined} />
                <AvatarFallback>{initials(a.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">
                  {a.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {a.email}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(new Date(a.createdAt), "dd MMM")}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="size-4" />
            Recent Events
          </CardTitle>
          <Link
            href="/admin/events"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            View all
            <ArrowRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentEvents.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No events yet.
            </p>
          )}
          {recentEvents.map((e) => (
            <div key={e.id} className="flex items-start gap-3">
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{e.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {format(new Date(e.startAt), "dd MMM yyyy")}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
              </div>
              <Badge
                variant={
                  e.status === "published"
                    ? "default"
                    : e.status === "cancelled"
                      ? "destructive"
                      : "secondary"
                }
              >
                {e.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Donations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="size-4" />
            Recent Donations
          </CardTitle>
          <Link
            href="/admin/donations"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            View all
            <ArrowRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentDonations.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No donations yet.
            </p>
          )}
          {recentDonations.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">
                  {d.donorName || "Anonymous"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {format(new Date(d.createdAt), "dd MMM yyyy")}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">
                  {d.currency} {d.amount.toLocaleString("en-IN")}
                </span>
                <Badge
                  variant={
                    d.status === "completed"
                      ? "default"
                      : d.status === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {d.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}