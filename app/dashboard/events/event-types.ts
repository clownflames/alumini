export type EventType = "in_person" | "online" | "hybrid";
export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export type Event = {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  eventType: EventType;
  status: EventStatus;
  startAt: string;
  endAt: string | null;
  location: string | null;
  meetingUrl: string | null;
  maxAttendees: number | null;
  collegeName: string | null;
  createdAt: string;

  registrationCount: number;
  isRegistered: boolean;
  isFull: boolean;
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  in_person: "In Person",
  online: "Online",
  hybrid: "Hybrid",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  cancelled: "Cancelled",
  completed: "Completed",
};