"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "./basic-info-tab";
import { EducationTab } from "./education-tab";
import { CareerTab } from "./career-tab";
import { SocialLinksTab } from "./social-links-tab";
import type {
  AlumniProfile,
  UserBasic,
  College,
  Department,
  Batch,
  Education,
  Experience,
  SocialLink,
} from "./profile-types";

export function ProfileClient({
  user,
  profile,
  education,
  experience,
  socialLinks,
  colleges,
  departments,
  batches,
}: {
  user: UserBasic;
  profile: AlumniProfile;
  education: Education[];
  experience: Experience[];
  socialLinks: SocialLink[];
  colleges: College[];
  departments: Department[];
  batches: Batch[];
}) {
  const [currentProfile, setCurrentProfile] = useState(profile);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Keep your profile up to date to get discovered by other alumni.
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="education">
            Education
            {education.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {education.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="career">
            Career
            {experience.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {experience.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="links">Social Links</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicInfoTab
            user={user}
            profile={currentProfile}
            onProfileUpdate={setCurrentProfile}
            colleges={colleges}
            departments={departments}
            batches={batches}
          />
        </TabsContent>

        <TabsContent value="education" className="mt-6">
          <EducationTab initialEducation={education} />
        </TabsContent>

        <TabsContent value="career" className="mt-6">
          <CareerTab initialExperience={experience} />
        </TabsContent>

        <TabsContent value="links" className="mt-6">
          <SocialLinksTab initialLinks={socialLinks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}