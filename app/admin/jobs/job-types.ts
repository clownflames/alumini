export type JobType =
  | "full_time"
  | "part_time"
  | "internship"
  | "contract"
  | "freelance";

export type JobExperience = "entry" | "mid" | "senior" | "lead";

export type Job = {
  id: string;
  title: string;
  description: string;
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
  postedBy: string;
  companyId: string | null;
  companyName: string | null;
};

export type Company = {
  id: string;
  name: string;
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