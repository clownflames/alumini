"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "faculty_preferences";

type Prefs = {
  emailOnNewMessage: boolean;
  emailOnNewEvent: boolean;
  emailOnNewJob: boolean;
  emailOnNewConnection: boolean;
  showEmailPublicly: boolean;
  allowDirectMessages: boolean;
};

const DEFAULTS: Prefs = {
  emailOnNewMessage: true,
  emailOnNewEvent: true,
  emailOnNewJob: false,
  emailOnNewConnection: false,
  showEmailPublicly: false,
  allowDirectMessages: true,
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
          description="When a new job is posted"
          checked={prefs.emailOnNewJob}
          onChange={(v) => update("emailOnNewJob", v)}
        />
        <ToggleRow
          label="New connection requests"
          description="When someone sends a connection request"
          checked={prefs.emailOnNewConnection}
          onChange={(v) => update("emailOnNewConnection", v)}
        />
      </section>

      <Separator />

      {/* Privacy */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Privacy</h3>
          <p className="text-xs text-muted-foreground">
            Control how others can reach you.
          </p>
        </div>

        <ToggleRow
          label="Show email publicly"
          description="Display your email on your profile"
          checked={prefs.showEmailPublicly}
          onChange={(v) => update("showEmailPublicly", v)}
        />
        <ToggleRow
          label="Allow direct messages"
          description="Let students and alumni message you directly"
          checked={prefs.allowDirectMessages}
          onChange={(v) => update("allowDirectMessages", v)}
        />
      </section>

      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        Preferences are stored locally on this device. Server-side sync will
        be added soon.
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