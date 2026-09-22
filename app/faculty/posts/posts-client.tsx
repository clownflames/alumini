"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PostTable } from "./post-table";
import { PostViewDrawer } from "./post-view-drawer";
import { PostDrawer, type PostFormValues } from "./post-drawer";
import { PostConfirmDialog } from "./post-dialog";
import type { Post, PostVisibility } from "./post-types";

export function PostsClient({
  initialPosts,
  currentUserId,
}: {
  initialPosts: Post[];
  currentUserId: string;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<
    "all" | PostVisibility
  >("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | "mine">("all");

  const [viewTarget, setViewTarget] = useState<Post | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Post | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<PostFormValues | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  const refetch = async () => {
    const res = await fetch("/api/faculty/post");
    const json = await res.json();
    if (json.success) setPosts(json.data);
  };

  const openCreate = () => {
    setDrawerMode("create");
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (p: Post) => {
    setDrawerMode("edit");
    setEditing(p);
    setDrawerOpen(true);
  };

  const handleDrawerSubmit = (values: PostFormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    setSubmitting(true);

    try {
      if (drawerMode === "create") {
        const res = await fetch("/api/faculty/post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Post created");
      } else if (editing) {
        const res = await fetch(`/api/faculty/post/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingValues),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        await refetch();
        toast.success("Post updated");
      }

      setConfirmOpen(false);
      setDrawerOpen(false);
      setPendingValues(null);
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = posts.filter((p) => {
    if (visibilityFilter !== "all" && p.visibility !== visibilityFilter)
      return false;
    if (scopeFilter === "mine" && p.userId !== currentUserId) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        p.content.toLowerCase().includes(q) ||
        (p.authorName || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Share updates and engage with your community.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Create Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by content or author..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />

        <Select
          value={scopeFilter}
          onValueChange={(v) => setScopeFilter(v as "all" | "mine")}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="mine">My Posts</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={visibilityFilter}
          onValueChange={(v) =>
            setVisibilityFilter(v as "all" | PostVisibility)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visibility</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="connections">Connections</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>

        {query || visibilityFilter !== "all" || scopeFilter !== "all" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setVisibilityFilter("all");
              setScopeFilter("all");
            }}
          >
            Clear
          </Button>
        ) : null}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {posts.length}
        </span>
      </div>

      {/* Table */}
      <PostTable
        data={filtered}
        currentUserId={currentUserId}
        onView={(p) => setViewTarget(p)}
        onEdit={openEdit}
      />

      {/* View drawer */}
      <PostViewDrawer
        open={!!viewTarget}
        onOpenChange={(v) => !v && setViewTarget(null)}
        post={viewTarget}
      />

      {/* Create / edit drawer */}
      <PostDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        post={editing}
        submitting={submitting}
        onSubmit={handleDrawerSubmit}
      />

      {/* Confirm dialog */}
      <PostConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        mode={drawerMode}
        loading={submitting}
        onConfirm={handleConfirm}
      />
    </div>
  );
}