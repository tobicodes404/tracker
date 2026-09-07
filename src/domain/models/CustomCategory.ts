export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  isPasswordProtected: boolean;
  passwordHash: string | null;
  manhwaIds: string[];
  createdAt: number;
}
