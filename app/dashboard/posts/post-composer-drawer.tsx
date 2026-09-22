"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";  // ← NEW
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Post, PostVisibility } from "./post-types";

export type PostFormValues = {
  content: string;
  image: string;
  visibility: PostVisibility;
};

const EMPTY: PostFormValues = {
  content: "",
  image: "",
  visibility: "public",
};

export function PostComposerDrawer({
  open,
  onOpenChange,
  mode,
  post,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  post: Post | null;
  submitting: boolean;
  onSubmit: (values: PostFormValues) => void;
}) {
  const [values, setValues] = useState<PostFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && post) {
      setValues({
        content: post.content,
        image: post.image ?? "",
        visibility: post.visibility,
      });
    } else {
      setValues(EMPTY);
    }
    setErrors({});
  }, [open, mode, post]);

  const set = <K extends keyof PostFormValues>(
    key: K,
    v: PostFormValues[K]
  ) => setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!values.content.trim()) errs.content = "Content is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[75vh] sm:max-w-none flex flex-col p-0 gap-0"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>
            {mode === "create" ? "Create Post" : "Edit Post"}
          </SheetTitle>
          <SheetDescription>
            Share an update with your network.
          </SheetDescription>
        </SheetHeader>

        <form
          id="post-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={values.content}
                onChange={(e) => set("content", e.target.value)}
                rows={6}
                placeholder="What's on your mind?"
              />
              {errors.content && (
                <p className="text-xs text-destructive">
                  {errors.content}
                </p>
              )}
            </div>

            {/* ✅ Cloudinary image upload — replaces plain URL input */}
            <div className="grid gap-2">
              <Label>Image</Label>
              <ImageUpload
                value={values.image || null}
                onChange={(url) => set("image", url ?? "")}
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground">
                Max 5 MB · JPG, PNG, WEBP, GIF
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={values.visibility}
                onValueChange={(v) => set("visibility", v as PostVisibility)}
              >
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    Public — Anyone can see
                  </SelectItem>
                  <SelectItem value="connections">
                    Connections — Only your connections
                  </SelectItem>
                  <SelectItem value="private">
                    Private — Only you
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <SheetFooter className="shrink-0 border-t px-6 py-4 flex-row justify-end gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="post-form" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {mode === "create" ? "Post" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}