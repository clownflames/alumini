"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PostCard } from "./post-card";
import {
  PostComposerDrawer,
  type PostFormValues,
} from "./post-composer-drawer";
import type { Post } from "./post-types";

type Tab = "all" | "mine";

export function PostsClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Post | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ---------- Fetch ---------- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alumni/posts");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      setPosts(json.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = posts.filter((p) => {
    if (tab === "mine") return p.isOwner;
    return true;
  });

  /* ---------- Toggle like (optimistic) ---------- */
  const handleToggleLike = async (post: Post) => {
    const newLiked = !post.isLikedByMe;
    const newCount = post.likeCount + (newLiked ? 1 : -1);

    // Optimistic
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, isLikedByMe: newLiked, likeCount: newCount }
          : p
      )
    );

    try {
      const res = await fetch(`/api/alumni/posts/${post.id}/like`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
    } catch (err: any) {
      // Revert
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isLikedByMe: post.isLikedByMe,
                likeCount: post.likeCount,
              }
            : p
        )
      );
      toast.error(err.message || "Failed to like");
    }
  };

  /* ---------- Open create ---------- */
  const openCreate = () => {
    setDrawerMode("create");
    setEditing(null);
    setDrawerOpen(true);
  };

  /* ---------- Open edit ---------- */
  const openEdit = (p: Post) => {
    setDrawerMode("edit");
    setEditing(p);
    setDrawerOpen(true);
  };

  /* ---------- Submit (create / edit) ---------- */
  const handleSubmit = async (values: PostFormValues) => {
    setSubmitting(true);
    try {
      const url =
        drawerMode === "create"
          ? "/api/alumni/posts"
          : `/api/alumni/posts/${editing!.id}`;
      const method = drawerMode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      toast.success(
        drawerMode === "create" ? "Post created" : "Post updated"
      );
      setDrawerOpen(false);

      // Refetch (server computes all aggregates)
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (post: Post) => {
    const snapshot = posts;
    setPosts((prev) => prev.filter((p) => p.id !== post.id));

    try {
      const res = await fetch(`/api/alumni/posts/${post.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      toast.success("Post deleted");
    } catch (err: any) {
      setPosts(snapshot);
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Share updates and engage with your network.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Create Post
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="all">
            Feed
            {posts.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {posts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mine">
            My Posts
            {posts.filter((p) => p.isOwner).length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {posts.filter((p) => p.isOwner).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Feed */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-12 text-center">
          <FileText className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {tab === "mine"
              ? "You haven't posted anything yet."
              : "No posts in your feed yet."}
          </p>
          <Button variant="outline" size="sm" onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Create Post
          </Button>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-4">
          {filtered.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleLike={handleToggleLike}
            />
          ))}
        </div>
      )}

      {/* Composer drawer */}
      <PostComposerDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        post={editing}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}