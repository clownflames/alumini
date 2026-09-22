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
  status: MentorshipStatus;
  focus: MentorshipFocus;
  requestMessage: string | null;
  goal: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;

  mentorId: string;
  mentorName: string;
  mentorImage: string | null;
  mentorHeadline: string | null;
  mentorJobTitle: string | null;

  menteeId: string;
  menteeName: string;
  menteeImage: string | null;

  // From current user's perspective
  role: "mentor" | "mentee";
};

export type AvailableMentor = {
  id: string;
  name: string;
  image: string | null;
  headline: string | null;
  jobTitle: string | null;
  city: string | null;
  collegeName: string | null;
  departmentName: string | null;

  // If already in a mentorship with current user
  existingMentorshipId: string | null;
  existingMentorshipStatus: MentorshipStatus | null;
  existingMentorshipDirection: "sent" | "received" | null;
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