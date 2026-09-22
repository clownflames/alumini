export type NotificationType =
  | "system"
  | "connection"
  | "message"
  | "event"
  | "job"
  | "post";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export const TYPE_LABELS: Record<NotificationType, string> = {
  system: "System",
  connection: "Connection",
  message: "Message",
  event: "Event",
  job: "Job",
  post: "Post",
};