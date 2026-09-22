"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "./overview-tab";
import { StudentsTab } from "./students-tab";
import { AlumniTab } from "./alumni-tab";
import { EventsTab } from "./events-tab";
import { JobsTab } from "./jobs-tab";

export type ReportsData = {
  overview: {
    students: number;
    alumni: number;
    faculty: number;
    verifiedAlumni: number;
    mentors: number;
    openToWork: number;
  };
  studentsByDept: { department: string; count: number }[];
  alumniByDept: { department: string; count: number }[];
  alumniByBatch: { batch: string; count: number }[];
  events: {
    total: number;
    byStatus: { status: string; count: number }[];
    byType: { type: string; count: number }[];
  };
  jobs: {
    total: number;
    applications: number;
    byType: { type: string; count: number }[];
    applicationsByStatus: { status: string; count: number }[];
  };
  donations: {
    total: number;
    count: number;
  };
};

export function ReportsClient({ reports }: { reports: ReportsData }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Analytics and breakdowns across students, alumni, events and jobs.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="alumni">Alumni</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab reports={reports} />
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <StudentsTab reports={reports} />
        </TabsContent>

        <TabsContent value="alumni" className="mt-4">
          <AlumniTab reports={reports} />
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <EventsTab reports={reports} />
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <JobsTab reports={reports} />
        </TabsContent>
      </Tabs>
    </div>
  );
}