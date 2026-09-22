export type AlumniProfile = {
  id: string | null;
  userId: string;

  firstName: string | null;
  lastName: string | null;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;

  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;

  currentJobTitle: string | null;
  graduationYear: number | null;

  collegeId: string | null;
  departmentId: string | null;
  batchId: string | null;

  profileCompleted: boolean;
  isVerified: boolean;
  isOpenToWork: boolean;
  isMentor: boolean;
  allowMessages: boolean;
};

export type UserBasic = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type College = { id: string; name: string };
export type Department = { id: string; name: string };
export type Batch = { id: string; year: number };

export type Education = {
  id: string;
  userId: string;
  collegeName: string;
  degree: string | null;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  description: string | null;
};

export type Experience = {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  currentlyWorking: boolean;
  description: string | null;
};

export type SocialLink = {
  id: string;
  userId: string;
  platform: string;
  url: string;
};