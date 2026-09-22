export type ConnectionStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "blocked";

export type Connection = {
  id: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;

  requesterId: string;
  receiverId: string;

  // other user (the one who is NOT current user)
  otherUserId: string;
  otherName: string;
  otherEmail: string;
  otherImage: string | null;
  otherHeadline: string | null;
  otherJobTitle: string | null;
  otherCity: string | null;

  // direction (from current user's perspective)
  direction: "sent" | "received";
};

export const STATUS_LABELS: Record<ConnectionStatus, string> = {
  pending: "Pending",
  accepted: "Connected",
  rejected: "Rejected",
  blocked: "Blocked",
};