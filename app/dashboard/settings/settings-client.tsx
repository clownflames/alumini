"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./profile-tab";
import { PasswordTab } from "./password-tab";
import { PrivacyTab } from "./privacy-tab";
import { PreferencesTab } from "./preferences-tab";
import type { AlumniProfile } from "./settings-types";

export function SettingsClient({
  profile: initialProfile,
}: {
  profile: AlumniProfile;
}) {
  const [profile, setProfile] = useState(initialProfile);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, privacy and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileTab profile={profile} onProfileUpdate={setProfile} />
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <PasswordTab />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <PrivacyTab profile={profile} />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}