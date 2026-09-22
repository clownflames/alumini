"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type {
  AlumniProfile,
  UserBasic,
  College,
  Department,
  Batch,
} from "./profile-types";

type FormValues = {
  firstName: string;
  lastName: string;
  headline: string;
  bio: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  currentJobTitle: string;
  graduationYear: string;
  collegeId: string;
  departmentId: string;
  batchId: string;
  isOpenToWork: boolean;
  isMentor: boolean;
  allowMessages: boolean;
};

function toForm(profile: AlumniProfile): FormValues {
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    phone: profile.phone ?? "",
    dateOfBirth: profile.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().slice(0, 10)
      : "",
    gender: profile.gender ?? "",
    city: profile.city ?? "",
    state: profile.state ?? "",
    country: profile.country ?? "",
    postalCode: profile.postalCode ?? "",
    currentJobTitle: profile.currentJobTitle ?? "",
    graduationYear:
      profile.graduationYear != null
        ? String(profile.graduationYear)
        : "",
    collegeId: profile.collegeId ?? "",
    departmentId: profile.departmentId ?? "",
    batchId: profile.batchId ?? "",
    isOpenToWork: profile.isOpenToWork,
    isMentor: profile.isMentor,
    allowMessages: profile.allowMessages,
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function BasicInfoTab({
  user,
  profile,
  onProfileUpdate,
  colleges,
  departments,
  batches,
}: {
  user: UserBasic;
  profile: AlumniProfile;
  onProfileUpdate: (p: AlumniProfile) => void;
  colleges: College[];
  departments: Department[];
  batches: Batch[];
}) {
  const [values, setValues] = useState<FormValues>(() => toForm(profile));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(toForm(profile));
  }, [profile]);

  const set = <K extends keyof FormValues>(
    key: K,
    v: FormValues[K]
  ) => setValues((s) => ({ ...s, [key]: v }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (
      values.graduationYear &&
      (Number(values.graduationYear) < 1900 ||
        Number(values.graduationYear) > 2100)
    ) {
      errs.graduationYear = "Year must be between 1900 and 2100";
    }
    if (values.phone && !/^[\d\s+\-()]{7,20}$/.test(values.phone)) {
      errs.phone = "Invalid phone number";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/alumni/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      onProfileUpdate({
        ...profile,
        ...values,
        graduationYear: values.graduationYear
          ? Number(values.graduationYear)
          : null,
        collegeId: values.collegeId || null,
        departmentId: values.departmentId || null,
        batchId: values.batchId || null,
      } as any);

      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback>{initials(user.name || "?")}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Personal */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium">Personal</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={values.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={values.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            value={values.headline}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="Software Engineer at Google"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={values.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={4}
            placeholder="Tell others about yourself..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={values.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={values.gender || "none"}
            onValueChange={(v) => set("gender", v === "none" ? "" : v)}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Prefer not to say</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Separator />

      {/* Location */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium">Location</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={values.state}
              onChange={(e) => set("state", e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={values.country}
              onChange={(e) => set("country", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={values.postalCode}
              onChange={(e) => set("postalCode", e.target.value)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Education */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium">Education</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="collegeId">College</Label>
            <Select
              value={values.collegeId || "none"}
              onValueChange={(v) =>
                set("collegeId", v === "none" ? "" : v)
              }
            >
              <SelectTrigger id="collegeId">
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {colleges.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="departmentId">Department</Label>
            <Select
              value={values.departmentId || "none"}
              onValueChange={(v) =>
                set("departmentId", v === "none" ? "" : v)
              }
            >
              <SelectTrigger id="departmentId">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="batchId">Batch</Label>
            <Select
              value={values.batchId || "none"}
              onValueChange={(v) => set("batchId", v === "none" ? "" : v)}
            >
              <SelectTrigger id="batchId">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {batches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="graduationYear">Graduation Year</Label>
            <Input
              id="graduationYear"
              type="number"
              min={1900}
              max={2100}
              value={values.graduationYear}
              onChange={(e) => set("graduationYear", e.target.value)}
            />
            {errors.graduationYear && (
              <p className="text-xs text-destructive">
                {errors.graduationYear}
              </p>
            )}
          </div>
        </div>
      </section>

      <Separator />

      {/* Career */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium">Career</h3>
        <div className="grid gap-2">
          <Label htmlFor="currentJobTitle">Current Job Title</Label>
          <Input
            id="currentJobTitle"
            value={values.currentJobTitle}
            onChange={(e) => set("currentJobTitle", e.target.value)}
          />
        </div>
      </section>

      <Separator />

      {/* Preferences */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium">Preferences</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <ToggleRow
            label="Open to work"
            description="Show in job seekers"
            checked={values.isOpenToWork}
            onChange={(v) => set("isOpenToWork", v)}
          />
          <ToggleRow
            label="Mentor"
            description="Available for mentorship"
            checked={values.isMentor}
            onChange={(v) => set("isMentor", v)}
          />
          <ToggleRow
            label="Allow messages"
            description="Others can message you"
            checked={values.allowMessages}
            onChange={(v) => set("allowMessages", v)}
          />
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end border-t pt-4">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      <Switch checked={checked} onCheckedChange={onChange} />
      <div>
        <Label className="cursor-pointer">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}