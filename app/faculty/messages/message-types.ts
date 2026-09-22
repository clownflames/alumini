export type MessageType = "text" | "image" | "file";

export type Conversation = {
  id: string;
  createdAt: string;
  updatedAt: string;
  // other participant(s) — for 1:1, first one
  otherUserName: string | null;
  otherUserEmail: string | null;
  otherUserImage: string | null;
  memberCount: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  senderImage: string | null;
  content: string | null;
  type: MessageType;
  attachmentUrl: string | null;
  isRead: boolean;
  createdAt: string;
};