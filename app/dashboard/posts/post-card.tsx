"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Globe,
  Users,
  Lock,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Post, Comment, VISIBILITY_LABELS } from "./post-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function VisibilityIcon({ v }: { v: Post["visibility"] }) {
  const Icon = v === "public" ? Globe : v === "connections" ? Users : Lock;
  return <Icon className="size-3" />;
}

export function PostCard({
  post,
  onEdit,
  onDelete,
  onToggleLike,
}: {
  post: Post;
  onEdit: (p: Post) => void;
  onDelete: (p: Post) => void;
  onToggleLike: (p: Post) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentSending, setCommentSending] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  /* ---------- Load comments when expanded ---------- */
  useEffect(() => {
    if (!showComments) return;
    let cancelled = false;
    (async () => {
      setCommentsLoading(true);
      try {
        const res = await fetch(`/api/alumni/posts/${post.id}/comments`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);
        if (!cancelled) setComments(json.data);
      } catch (err: any) {
        if (!cancelled) toast.error(err.message || "Failed to load comments");
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showComments, post.id]);

  /* ---------- Add comment ---------- */
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentDraft.trim() || commentSending) return;

    const content = commentDraft.trim();
    setCommentDraft("");
    setCommentSending(true);

    try {
      const res = await fetch(`/api/alumni/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      // Refetch comments
      const refetchRes = await fetch(
        `/api/alumni/posts/${post.id}/comments`
      );
      const refetchJson = await refetchRes.json();
      if (refetchJson.success) setComments(refetchJson.data);

      toast.success("Comment added");
    } catch (err: any) {
      toast.error(err.message || "Failed to comment");
      setCommentDraft(content);
    } finally {
      setCommentSending(false);
    }
  };

  /* ---------- Delete comment ---------- */
  const handleDeleteComment = async (commentId: string) => {
    const snapshot = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    try {
      const res = await fetch(
        `/api/alumni/posts/${post.id}/comments/${commentId}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      toast.success("Comment deleted");
    } catch (err: any) {
      setComments(snapshot);
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="rounded-md border bg-card">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={post.author.image || undefined} />
          <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">
              {post.author.name}
            </span>
            {post.isOwner && (
              <Badge variant="secondary" className="text-xs">
                You
              </Badge>
            )}
          </div>
          {post.author.headline && (
            <p className="truncate text-xs text-muted-foreground">
              {post.author.headline}
            </p>
          )}
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <VisibilityIcon v={post.visibility} />
              {VISIBILITY_LABELS[post.visibility]}
            </span>
          </div>
        </div>

        {post.isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" />}
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(post)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteConfirm(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>

        {post.image && (
          <img
            src={post.image}
            alt="post"
            className="mt-3 max-h-96 w-full rounded-md object-cover"
          />
        )}
      </div>

      {/* Stats + actions */}
      <div className="border-t px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {post.likeCount > 0 && (
              <span>
                {post.likeCount}{" "}
                {post.likeCount === 1 ? "like" : "likes"}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {post.commentCount > 0 && (
              <button
                onClick={() => setShowComments((v) => !v)}
                className="hover:text-primary"
              >
                {post.commentCount}{" "}
                {post.commentCount === 1 ? "comment" : "comments"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-1 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleLike(post)}
            className={cn(
              "flex-1",
              post.isLikedByMe && "text-destructive hover:text-destructive"
            )}
          >
            <Heart
              className={cn(
                "mr-2 size-4",
                post.isLikedByMe && "fill-current"
              )}
            />
            {post.isLikedByMe ? "Liked" : "Like"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments((v) => !v)}
            className="flex-1"
          >
            <MessageCircle className="mr-2 size-4" />
            Comment
          </Button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t p-4">
          {commentsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {comments.length > 0 && (
                <div className="mb-3 space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <Avatar className="size-7 shrink-0">
                        <AvatarImage src={c.userImage || undefined} />
                        <AvatarFallback className="text-xs">
                          {initials(c.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="rounded-lg bg-muted px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium">
                              {c.userName}
                            </span>
                            {c.isOwner && (
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="size-3" />
                              </button>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm">{c.content}</p>
                        </div>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(c.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={handleAddComment}
                className="flex items-center gap-2"
              >
                <Input
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Write a comment..."
                  disabled={commentSending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={commentSending || !commentDraft.trim()}
                >
                  {commentSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All likes and comments will be
              removed too.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onDelete(post);
                setDeleteConfirm(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}