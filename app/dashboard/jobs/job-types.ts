export type JobType =
  | "full_time"
  | "part_time"
  | "internship"
  | "contract"
  | "freelance";

export type JobExperience = "entry" | "mid" | "senior" | "lead";

export type ApplicationStatus =
  | "applied"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "accepted";

export type Job = {
  id: string;
  title: string;
  description: string;
  companyName: string | null;
  companyLogo: string | null;
  location: string | null;
  remote: boolean;
  jobType: JobType;
  experienceLevel: JobExperience | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  applicationUrl: string | null;
  expiresAt: string | null;
  createdAt: string;

  // User-specific
  hasApplied: boolean;
  applicationStatus: ApplicationStatus | null;
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  internship: "Internship",
  contract: "Contract",
  freelance: "Freelance",
};

export const JOB_EXPERIENCE_LABELS: Record<JobExperience, string> = {
  entry: "Entry Level",
  mid: "Mid Level",
  senior: "Senior Level",
  lead: "Lead",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  accepted: "Accepted",
};

export function formatSalary(job: Job): string {
  if (job.salaryMin == null && job.salaryMax == null) return "Not disclosed";
  const cur = job.salaryCurrency || "INR";
  const fmt = (n: number) => n.toLocaleString("en-IN");
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${cur} ${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
  }
  if (job.salaryMin != null) return `${cur} ${fmt(job.salaryMin)}+`;
  return `up to ${cur} ${fmt(job.salaryMax!)}`;
}