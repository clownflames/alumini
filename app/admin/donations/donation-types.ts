export type DonationStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded";

export type Donation = {
  id: string;
  amount: number;
  currency: string;
  status: DonationStatus;
  paymentProvider: string | null;
  paymentId: string | null;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  donorName: string | null;
  donorEmail: string | null;
  collegeId: string | null;
  collegeName: string | null;
};

export type College = {
  id: string;
  name: string;
};

export const STATUS_LABELS: Record<DonationStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
};