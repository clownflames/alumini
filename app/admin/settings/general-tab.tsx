"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function GeneralTab() {
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    siteName: "Alumni Network",
    siteTagline: "Connect. Grow. Give Back.",
    supportEmail: "support@alumni.app",
    supportPhone: "",
    footerText: "",
    allowRegistrations: true,
    requireEmailVerification: false,
    maintenanceMode: false,
  });

  const set = <K extends keyof typeof values>(key: K, v: (typeof values)[K]) =>
    setValues((s) => ({ ...s, [key]: v }));

  const handleSave = async () => {
    setSaving(true);
    // TODO: wire to /api/admin/settings/general when ready
    await new Promise((r) => setTimeout(r, 600));
    toast.success("General settings saved");
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">General</h2>
        <p className="text-sm text-muted-foreground">
          Platform name, support info and registration behaviour.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="siteName">Site Name</Label>
          <Input
            id="siteName"
            value={values.siteName}
            onChange={(e) => set("siteName", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="siteTagline">Tagline</Label>
          <Input
            id="siteTagline"
            value={values.siteTagline}
            onChange={(e) => set("siteTagline", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="supportEmail">Support Email</Label>
          <Input
            id="supportEmail"
            type="email"
            value={values.supportEmail}
            onChange={(e) => set("supportEmail", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="supportPhone">Support Phone</Label>
          <Input
            id="supportPhone"
            value={values.supportPhone}
            onChange={(e) => set("supportPhone", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="footerText">Footer Text</Label>
        <Textarea
          id="footerText"
          rows={3}
          value={values.footerText}
          onChange={(e) => set("footerText", e.target.value)}
          placeholder="© 2026 Alumni Network. All rights reserved."
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <ToggleRow
          label="Allow new registrations"
          description="Disable to stop new alumni/student signups."
          checked={values.allowRegistrations}
          onChange={(v) => set("allowRegistrations", v)}
        />
        <ToggleRow
          label="Require email verification"
          description="Users must verify email before accessing the app."
          checked={values.requireEmailVerification}
          onChange={(v) => set("requireEmailVerification", v)}
        />
        <ToggleRow
          label="Maintenance mode"
          description="Only super admins can access the platform."
          checked={values.maintenanceMode}
          onChange={(v) => set("maintenanceMode", v)}
        />
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          Save Changes
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