export type AnnouncementPriority = "low" | "normal" | "high" | "urgent";
export type AnnouncementAudience = "all" | "alumni" | "students" | "faculty";

export type Announcement = {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  isPinned: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  collegeId: string | null;
  collegeName: string | null;
};

export type College = {
  id: string;
  name: string;
};

export const PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  all: "Everyone",
  alumni: "Alumni",
  students: "Students",
  faculty: "Faculty",
};