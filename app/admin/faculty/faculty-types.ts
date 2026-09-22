export type UserStatus = "active" | "suspended" | "pending";
export type UserRole = "alumni" | "student" | "admin" | "super_admin";

export type Faculty = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};