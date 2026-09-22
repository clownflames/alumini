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
import { EVENT_STATUS_LABELS, EVENT_TYPE_LABELS } from "@/lib/event-labels";
import type { ReportsData } from "./reports-client";

// Helper labels — tu apne constants file se import kar sakta hai
// Filhal inline fallback:
const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  cancelled: "Cancelled",
  completed: "Completed",
};

const TYPE_LABELS: Record<string, string> = {
  in_person: "In Person",
  online: "Online",
  hybrid: "Hybrid",
};

export function EventsTab({ reports }: { reports: ReportsData }) {
  const handleStatusExport = () => {
    downloadCsv(
      "events-by-status",
      reports.events.byStatus.map((r) => ({
        Status: STATUS_LABELS[r.status] || r.status,
        Count: r.count,
      }))
    );
  };

  const handleTypeExport = () => {
    downloadCsv(
      "events-by-type",
      reports.events.byType.map((r) => ({
        Type: TYPE_LABELS[r.type] || r.type,
        Count: r.count,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Events Breakdown</h2>
        <p className="text-sm text-muted-foreground">
          Total {reports.events.total} events.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">By Status</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStatusExport}
              disabled={!reports.events.byStatus.length}
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
                {reports.events.byStatus.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-20 text-center text-muted-foreground"
                    >
                      No data.
                    </TableCell>
                  </TableRow>
                )}
                {reports.events.byStatus.map((r) => (
                  <TableRow key={r.status}>
                    <TableCell>
                      {STATUS_LABELS[r.status] || r.status}
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

        {/* By Type */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium">By Type</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTypeExport}
              disabled={!reports.events.byType.length}
            >
              <Download className="mr-2 size-4" />
              Export
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.events.byType.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-20 text-center text-muted-foreground"
                    >
                      No data.
                    </TableCell>
                  </TableRow>
                )}
                {reports.events.byType.map((r) => (
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
      </div>
    </div>
  );
}