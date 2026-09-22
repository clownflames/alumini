export type PostVisibility = "public" | "connections" | "private";

export type Post = {
  id: string;
  content: string;
  image: string | null;
  visibility: PostVisibility;
  createdAt: string;
  updatedAt: string;
  userId: string;
  authorName: string | null;
  authorEmail: string | null;
  authorImage: string | null;
};

export const VISIBILITY_LABELS: Record<PostVisibility, string> = {
  public: "Public",
  connections: "Connections",
  private: "Private",
};