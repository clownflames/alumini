export type AlumniStatus = "active" | "suspended" | "pending";

export type Alumni = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  status: AlumniStatus;
  createdAt: string;

  profileId: string | null;
  firstName: string | null;
  lastName: string | null;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  currentJobTitle: string | null;
  graduationYear: number | null;
  profileCompleted: boolean | null;
  isVerified: boolean | null;
  isOpenToWork: boolean | null;
  isMentor: boolean | null;

  collegeId: string | null;
  collegeName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  batchId: string | null;
  batchYear: number | null;
};

export type College = { id: string; name: string };
export type Department = { id: string; name: string };
export type Batch = { id: string; year: number };

export const STATUS_LABELS: Record<AlumniStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};