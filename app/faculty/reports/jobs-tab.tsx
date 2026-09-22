"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCsv } from "./export-utils";
import type { ReportsData } from "./reports-client";

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  internship: "Internship",
  contract: "Contract",
  freelance: "Freelance",
};

const APP_STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  accepted: "Accepted",
};

export function JobsTab({ reports }: { reports: ReportsData }) {
  const handleTypeExport = () => {
    downloadCsv(
      "jobs-by-type",
      reports.jobs.byType.map((r) => ({
        Type: TYPE_LABELS[r.type] || r.type,
        Count: r.count,
      }))
    );
  };

  const handleAppExport = () => {
    downloadCsv(
      "applications-by-status",
      reports.jobs.applicationsByStatus.map((r) => ({
        Status: APP_STATUS_LABELS[r.status] || r.status,
        Count: r.count,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Jobs & Applications</h2>
        <p className="text-sm text-muted-foreground">
          Total {reports.jobs.total} job postings ·{" "}
          {reports.jobs.applications} applications.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Type */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">Jobs by Type</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTypeExport}
              disabled={!reports.jobs.byType.length}
            >
              <Download className="mr-2 size-4" />
              Export
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Type</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.jobs.byType.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-20 text-center text-muted-foreground"
                    >
                      No data.
                    </TableCell>
                  </TableRow>
                )}
                {reports.jobs.byType.map((r) => (
                  <TableRow key={r.type}>
                    <TableCell>
                      {TYPE_LABELS[r.type] || r.type}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {r.count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Applications by Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">
              Applications by Status
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAppExport}
              disabled={!reports.jobs.applicationsByStatus.length}
            >
              <Download className="mr-2 size-4" />
              Export
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.jobs.applicationsByStatus.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-20 text-center text-muted-foreground"
                    >
                      No data.
                    </TableCell>
                  </TableRow>
                )}
                {reports.jobs.applicationsByStatus.map((r) => (
                  <TableRow key={r.status}>
                    <TableCell>
                      {APP_STATUS_LABELS[r.status] || r.status}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {r.count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}