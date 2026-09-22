"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { AlumniProfile } from "./settings-types";

type PrivacyPrefs = {
  allowMessages: boolean;
  isOpenToWork: boolean;
  isMentor: boolean;
};

export function PrivacyTab({ profile }: { profile: AlumniProfile }) {
  const [prefs, setPrefs] = useState<PrivacyPrefs>({
    allowMessages: profile.allowMessages,
    isOpenToWork: profile.isOpenToWork,
    isMentor: profile.isMentor,
  });
  const [initial, setInitial] = useState<PrivacyPrefs>(prefs);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next = {
      allowMessages: profile.allowMessages,
      isOpenToWork: profile.isOpenToWork,
      isMentor: profile.isMentor,
    };
    setPrefs(next);
    setInitial(next);
  }, [profile]);

  const isDirty =
    prefs.allowMessages !== initial.allowMessages ||
    prefs.isOpenToWork !== initial.isOpenToWork ||
    prefs.isMentor !== initial.isMentor;

  const update = <K extends keyof PrivacyPrefs>(
    key: K,
    v: PrivacyPrefs[K]
  ) => setPrefs((s) => ({ ...s, [key]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/alumni/settings/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      setInitial(prefs);
      toast.success("Privacy settings updated");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Messages</h3>
          <p className="text-xs text-muted-foreground">
            Control who can reach you.
          </p>
        </div>

        <ToggleRow
          label="Allow direct messages"
          description="Let other alumni send you private messages"
          checked={prefs.allowMessages}
          onChange={(v) => update("allowMessages", v)}
        />
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Visibility</h3>
          <p className="text-xs text-muted-foreground">
            Choose how you appear in the alumni directory.
          </p>
        </div>

        <ToggleRow
          label="Open to work"
          description="Show a badge on your profile indicating you're looking for opportunities"
          checked={prefs.isOpenToWork}
          onChange={(v) => update("isOpenToWork", v)}
        />

        <ToggleRow
          label="Available as mentor"
          description="Appear in the mentorship discovery list"
          checked={prefs.isMentor}
          onChange={(v) => update("isMentor", v)}
        />
      </section>

      <div className="flex justify-end border-t pt-4">
        <Button onClick={handleSave} disabled={saving || !isDirty}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save Privacy Settings
        </Button>
      </div>
    </div>
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
    <div className="flex items-center justify-between gap-4 rounded-md border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}