"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SocialLink } from "./profile-types";

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "website", label: "Personal Website" },
  { value: "other", label: "Other" },
];

export function SocialLinksTab({
  initialLinks,
}: {
  initialLinks: SocialLink[];
}) {
  const [links, setLinks] = useState(initialLinks);
  const [platform, setPlatform] = useState("linkedin");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("URL is required");
      return;
    }
    if (!/^https?:\/\/.+/.test(url)) {
      setError("URL must start with http:// or https://");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/alumni/social-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, url }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setLinks((prev) => [json.data, ...prev]);
      setUrl("");
      toast.success("Link added");
    } catch (err: any) {
      setError(err.message || "Failed to add link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const snapshot = links;
    setLinks((prev) => prev.filter((l) => l.id !== id));

    try {
      const res = await fetch(`/api/alumni/social-links/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      toast.success("Link deleted");
    } catch (err: any) {
      setLinks(snapshot);
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-medium">Social Links</h2>
        <p className="text-sm text-muted-foreground">
          Add links to your profiles so others can connect with you.
        </p>
      </div>

      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="grid gap-3 rounded-md border p-4 sm:grid-cols-[180px_1fr_auto]"
      >
        <div className="grid gap-2">
          <Label htmlFor="platform">Platform</Label>
          <Select value={platform} onValueChange={(v) => setPlatform(v ?? "linkedin")}>
            <SelectTrigger id="platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="flex items-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Plus className="mr-2 size-4" />
            )}
            Add
          </Button>
        </div>
      </form>

      {/* List */}
      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-12 text-center">
          <Link2 className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No social links added yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((l) => {
            const label =
              PLATFORMS.find((p) => p.value === l.platform)?.label ||
              l.platform;
            return (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-muted p-2">
                    <Link2 className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      {l.url.length > 60
                        ? `${l.url.slice(0, 60)}...`
                        : l.url}
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(l.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}