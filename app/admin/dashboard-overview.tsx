"use client";

import { StatsCards } from "./stats-cards";
import { QuickActions } from "./quick-actions";
import { RecentSection } from "./recent-section";

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

export function DashboardOverview({
  userName,
  stats,
  recentAlumni,
  recentEvents,
  recentDonations,
}: {
  userName: string;
  stats: Stats;
  recentAlumni: Alumni[];
  recentEvents: Event[];
  recentDonations: Donation[];
}) {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back, {userName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's what's happening across your platform today.
        </p>
      </div>

      {/* Stats grid */}
      <StatsCards stats={stats} />

      {/* Quick actions */}
      <QuickActions />

      {/* Recent activity */}
      <RecentSection
        recentAlumni={recentAlumni}
        recentEvents={recentEvents}
        recentDonations={recentDonations}
      />
    </div>
  );
}