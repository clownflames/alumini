export type UserStatus = "active" | "suspended" | "pending";

export type Student = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  status: UserStatus;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};