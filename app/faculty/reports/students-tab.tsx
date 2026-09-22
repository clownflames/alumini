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

export function StudentsTab({ reports }: { reports: ReportsData }) {
  const total = reports.overview.students;

  const handleExport = () => {
    downloadCsv(
      "students-by-department",
      reports.studentsByDept.map((r) => ({
        Department: r.department,
        Students: r.count,
      }))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Students Breakdown</h2>
          <p className="text-sm text-muted-foreground">
            Total {total} students across all departments.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!reports.studentsByDept.length}
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
              <TableHead className="text-right">Students</TableHead>
              <TableHead className="text-right">% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.studentsByDept.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data.
                </TableCell>
              </TableRow>
            )}
            {reports.studentsByDept.map((r) => {
              const pct =
                total > 0 ? ((r.count / total) * 100).toFixed(1) : "0.0";
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
  );
}