export type VerificationStatus = "pending" | "approved" | "rejected";

export type VerificationRequest = {
  id: string;
  fullName: string;
  graduationYear: number | null;
  rollNumber: string | null;
  documentUrl: string | null;
  additionalInfo: string | null;
  status: VerificationStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userEmail: string | null;
  userImage: string | null;
  collegeId: string | null;
  collegeName: string | null;
  departmentId: string | null;
  departmentName: string | null;
};

export type College = {
  id: string;
  name: string;
};

export type Department = {
  id: string;
  name: string;
};

export const STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};