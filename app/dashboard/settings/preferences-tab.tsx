"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "alumni_preferences";

type Prefs = {
  emailOnNewMessage: boolean;
  emailOnNewEvent: boolean;
  emailOnNewJob: boolean;
  emailOnNewConnection: boolean;
  emailOnMentorship: boolean;
  digestFrequency: "daily" | "weekly" | "never";
};

const DEFAULTS: Prefs = {
  emailOnNewMessage: true,
  emailOnNewEvent: true,
  emailOnNewJob: true,
  emailOnNewConnection: true,
  emailOnMentorship: true,
  digestFrequency: "weekly",
};

export function PreferencesTab() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  const update = <K extends keyof Prefs>(key: K, v: Prefs[K]) => {
    const next = { ...prefs, [key]: v };
    setPrefs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      toast.success("Preference updated");
    } catch {
      toast.error("Failed to save preference");
    }
  };

  if (!hydrated) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Email notifications */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Email Notifications</h3>
          <p className="text-xs text-muted-foreground">
            Choose what triggers email alerts.
          </p>
        </div>

        <ToggleRow
          label="New messages"
          description="When you receive a direct message"
          checked={prefs.emailOnNewMessage}
          onChange={(v) => update("emailOnNewMessage", v)}
        />
        <ToggleRow
          label="Event announcements"
          description="When a new event is published"
          checked={prefs.emailOnNewEvent}
          onChange={(v) => update("emailOnNewEvent", v)}
        />
        <ToggleRow
          label="New jobs"
          description="When a matching job is posted"
          checked={prefs.emailOnNewJob}
          onChange={(v) => update("emailOnNewJob", v)}
        />
        <ToggleRow
          label="Connection requests"
          description="When someone sends a connection request"
          checked={prefs.emailOnNewConnection}
          onChange={(v) => update("emailOnNewConnection", v)}
        />
        <ToggleRow
          label="Mentorship activity"
          description="When someone requests your mentorship or responds"
          checked={prefs.emailOnMentorship}
          onChange={(v) => update("emailOnMentorship", v)}
        />
      </section>

      <Separator />

      {/* Digest */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Digest</h3>
          <p className="text-xs text-muted-foreground">
            How often you want a summary email.
          </p>
        </div>
        <div className="grid gap-2">
          <Label>Frequency</Label>
          <div className="flex flex-wrap gap-2">
            {(["daily", "weekly", "never"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => update("digestFrequency", f)}
                className={
                  "rounded-md border px-3 py-1.5 text-sm capitalize transition-colors " +
                  (prefs.digestFrequency === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-accent")
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        Preferences are stored locally on this device. Server-side sync will be
        added soon.
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