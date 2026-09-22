export type MessageType = "text" | "image" | "file";

export type Conversation = {
  id: string;
  createdAt: string;
  updatedAt: string;

  otherUserId: string | null;
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

export type Contact = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  headline: string | null;
};