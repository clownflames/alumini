export type UserStatus = "active" | "suspended" | "pending";

export type Alumni = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  status: UserStatus;
  createdAt: string;

  // profile
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

  // relations
  collegeName: string | null;
  departmentName: string | null;
  batchYear: number | null;
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};