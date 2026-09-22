"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function PostDrawer({
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
        content: post.content ?? "",
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
    if (values.content.trim().length < 3)
      errs.content = "Content is too short";
    if (values.image && !/^https?:\/\/.+/.test(values.image))
      errs.image = "Image must be a valid URL (http/https)";
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
        className="h-[80vh] sm:max-w-none flex flex-col p-0 gap-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle>
            {mode === "create" ? "Create Post" : "Edit Post"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Share an update with your community."
              : "Update the post content below."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="faculty-post-form"
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
                placeholder="What's on your mind?"
                rows={6}
              />
              {errors.content && (
                <p className="text-xs text-destructive">{errors.content}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={values.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="https://..."
              />
              {errors.image && (
                <p className="text-xs text-destructive">{errors.image}</p>
              )}
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
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="connections">Connections</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
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
          <Button
            type="submit"
            form="faculty-post-form"
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}