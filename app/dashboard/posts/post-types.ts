export type PostVisibility = "public" | "connections" | "private";

export type PostAuthor = {
  id: string;
  name: string;
  image: string | null;
  headline: string | null;
};

export type Post = {
  id: string;
  content: string;
  image: string | null;
  visibility: PostVisibility;
  createdAt: string;
  updatedAt: string;

  author: PostAuthor;
  isOwner: boolean;

  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userImage: string | null;
  content: string;
  createdAt: string;
  isOwner: boolean;
};

export const VISIBILITY_LABELS: Record<PostVisibility, string> = {
  public: "Public",
  connections: "Connections",
  private: "Private",
};