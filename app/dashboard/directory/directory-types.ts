export type AlumniDirectoryItem = {
  id: string;
  name: string;
  email: string;
  image: string | null;

  firstName: string | null;
  lastName: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  currentJobTitle: string | null;
  graduationYear: number | null;

  collegeName: string | null;
  departmentName: string | null;
  batchYear: number | null;

  isVerified: boolean;
  isMentor: boolean;
  isOpenToWork: boolean;

  connectionStatus: "none" | "pending_sent" | "pending_received" | "accepted";
  connectionId: string | null;
};

export type College = { id: string; name: string };
export type Department = { id: string; name: string };
export type Batch = { id: string; year: number };