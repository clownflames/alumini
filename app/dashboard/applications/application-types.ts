export type ApplicationStatus =
  | "applied"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "accepted";

export type JobType =
  | "full_time"
  | "part_time"
  | "internship"
  | "contract"
  | "freelance";

export type JobExperience = "entry" | "mid" | "senior" | "lead";

export type Application = {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeUrl: string | null;
  createdAt: string;
  updatedAt: string;

  jobId: string;
  jobTitle: string;
  jobType: JobType;
  jobLocation: string | null;
  jobRemote: boolean;
  jobExperienceLevel: JobExperience | null;
  jobSalaryMin: number | null;
  jobSalaryMax: number | null;
  jobSalaryCurrency: string | null;

  companyName: string | null;
  companyLogo: string | null;
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  reviewing: "Under Review",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  accepted: "Accepted",
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

export function formatSalary(app: Application): string {
  if (app.jobSalaryMin == null && app.jobSalaryMax == null)
    return "Not disclosed";
  const cur = app.jobSalaryCurrency || "INR";
  const fmt = (n: number) => n.toLocaleString("en-IN");
  if (app.jobSalaryMin != null && app.jobSalaryMax != null) {
    return `${cur} ${fmt(app.jobSalaryMin)} – ${fmt(app.jobSalaryMax)}`;
  }
  if (app.jobSalaryMin != null) return `${cur} ${fmt(app.jobSalaryMin)}+`;
  return `up to ${cur} ${fmt(app.jobSalaryMax!)}`;
}