export type Branch = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  departmentId: string;
  departmentName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Department = {
  id: string;
  name: string;
  collegeName?: string | null;
};