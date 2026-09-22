"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FacultyProfile } from "./settings-types";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProfileTab({
  profile,
  onProfileUpdate,
}: {
  profile: FacultyProfile;
  onProfileUpdate: (p: FacultyProfile) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [image, setImage] = useState(profile.image || "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setName(profile.name);
    setImage(profile.image || "");
  }, [profile]);

  const isDirty =
    name !== profile.name || (image || null) !== (profile.image || null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (image && !/^https?:\/\/.+/.test(image))
      errs.image = "Image must be a valid URL (http/https)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/faculty/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      onProfileUpdate(json.data);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={image || undefined} />
          <AvatarFallback>{initials(name || "?")}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{name || "Your Name"}</p>
          <p className="text-xs text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={profile.email} disabled />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed. Contact super admin if needed.
        </p>
      </div>

      {/* Name */}
      <div className="grid gap-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Image URL */}
      <div className="grid gap-2">
        <Label htmlFor="image">Profile Image URL</Label>
        <Input
          id="image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://..."
        />
        {errors.image && (
          <p className="text-xs text-destructive">{errors.image}</p>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving || !isDirty}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}