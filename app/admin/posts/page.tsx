import { auth } from "@/lib/auth";
import { db } from "@/db";
import { posts, user as userTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PostsClient } from "./posts-client";

export default async function PostsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "super_admin") redirect("/dashboard");

  const rows = await db
    .select({
      id: posts.id,
      content: posts.content,
      image: posts.image,
      visibility: posts.visibility,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      userId: posts.userId,
      authorName: userTable.name,
      authorEmail: userTable.email,
      authorImage: userTable.image,
    })
    .from(posts)
    .leftJoin(userTable, eq(posts.userId, userTable.id))
    .orderBy(desc(posts.createdAt));

  const serialized = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <PostsClient initialPosts={serialized} />;
}