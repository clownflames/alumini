export type AlumniProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;

  // Privacy flags
  allowMessages: boolean;
  isOpenToWork: boolean;
  isMentor: boolean;
};