"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Job, JOB_TYPE_LABELS, JOB_EXPERIENCE_LABELS } from "./job-types";

function formatSalary(job: Job) {
  if (job.salaryMin == null && job.salaryMax == null) return "—";
  const cur = job.salaryCurrency || "INR";
  const fmt = (n: number) => n.toLocaleString("en-IN");
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${cur} ${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
  }
  if (job.salaryMin != null) return `${cur} ${fmt(job.salaryMin)}+`;
  return `up to ${cur} ${fmt(job.salaryMax!)}`;
}

export function JobTable({
  data,
  onEdit,
  onDelete,
}: {
  data: Job[];
  onEdit: (j: Job) => void;
  onDelete: (j: Job) => void;
}) {
  if (!data.length) {
    return (
      <div className="rounded-md border">
        <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
          No jobs found.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Posted</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{job.title}</span>
                  {job.remote && (
                    <span className="text-xs text-muted-foreground">
                      Remote
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{job.companyName || "—"}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {JOB_TYPE_LABELS[job.jobType]}
                </Badge>
              </TableCell>
              <TableCell>
                {job.experienceLevel
                  ? JOB_EXPERIENCE_LABELS[job.experienceLevel]
                  : "—"}
              </TableCell>
              <TableCell>{job.location || "—"}</TableCell>
              <TableCell className="text-sm">{formatSalary(job)}</TableCell>
              <TableCell>
                {format(new Date(job.createdAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(job)}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(job)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}