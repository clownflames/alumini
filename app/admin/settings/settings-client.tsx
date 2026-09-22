"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollegesTab } from "./colleges-tab";
import { GeneralTab } from "./general-tab";

type College = {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  website: string | null;
  logo: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export function SettingsClient({
  initialColleges,
}: {
  initialColleges: College[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage colleges, branding, and platform preferences.
        </p>
      </div>

      <Tabs defaultValue="colleges" className="w-full">
        <TabsList>
          <TabsTrigger value="colleges">Colleges</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="colleges" className="mt-4">
          <CollegesTab initialColleges={initialColleges} />
        </TabsContent>

        <TabsContent value="general" className="mt-4">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="branding" className="mt-4">
          <div className="rounded-md border p-6 text-sm text-muted-foreground">
            Branding options coming soon.
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <div className="rounded-md border p-6 text-sm text-muted-foreground">
            Notification preferences coming soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}