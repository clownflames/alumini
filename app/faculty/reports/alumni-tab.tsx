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

export function AlumniTab({ reports }: { reports: ReportsData }) {
  const total = reports.overview.alumni;

  const handleDeptExport = () => {
    downloadCsv(
      "alumni-by-department",
      reports.alumniByDept.map((r) => ({
        Department: r.department,
        Alumni: r.count,
      }))
    );
  };

  const handleBatchExport = () => {
    downloadCsv(
      "alumni-by-batch",
      reports.alumniByBatch.map((r) => ({
        Batch: r.batch,
        Alumni: r.count,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* By Department */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium">Alumni by Department</h2>
            <p className="text-sm text-muted-foreground">
              Total {total} alumni.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleDeptExport}
            disabled={!reports.alumniByDept.length}
          >
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Alumni</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.alumniByDept.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No data.
                  </TableCell>
                </TableRow>
              )}
              {reports.alumniByDept.map((r) => {
                const pct =
                  total > 0
                    ? ((r.count / total) * 100).toFixed(1)
                    : "0.0";
                return (
                  <TableRow key={r.department}>
                    <TableCell>{r.department}</TableCell>
                    <TableCell className="text-right font-medium">
                      {r.count}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {pct}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* By Batch */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Alumni by Batch Year</h2>
          <Button
            variant="outline"
            onClick={handleBatchExport}
            disabled={!reports.alumniByBatch.length}
          >
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Year</TableHead>
                <TableHead className="text-right">Alumni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.alumniByBatch.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No data.
                  </TableCell>
                </TableRow>
              )}
              {reports.alumniByBatch.map((r) => (
                <TableRow key={r.batch}>
                  <TableCell>{r.batch}</TableCell>
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
  );
}