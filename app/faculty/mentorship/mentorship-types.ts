export type MentorshipStatus =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

export type MentorshipFocus =
  | "career"
  | "academics"
  | "entrepreneurship"
  | "higher_studies"
  | "general";

export type Mentorship = {
  id: string;
  focus: MentorshipFocus;
  status: MentorshipStatus;
  requestMessage: string | null;
  goal: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;

  mentorId: string;
  mentorName: string | null;
  mentorEmail: string | null;
  mentorImage: string | null;
  mentorHeadline: string | null;
  mentorJobTitle: string | null;

  menteeId: string;
  menteeName: string | null;
  menteeEmail: string | null;
  menteeImage: string | null;
};

export const STATUS_LABELS: Record<MentorshipStatus, string> = {
  pending: "Pending",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const FOCUS_LABELS: Record<MentorshipFocus, string> = {
  career: "Career",
  academics: "Academics",
  entrepreneurship: "Entrepreneurship",
  higher_studies: "Higher Studies",
  general: "General",
};