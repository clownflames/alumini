export type Batch = {
  id: string;
  year: number;
  startYear: number | null;
  endYear: number | null;
  collegeId: string;
  collegeName: string | null;
  createdAt: string;
};

export type College = {
  id: string;
  name: string;
};