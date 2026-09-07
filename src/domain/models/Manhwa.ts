export interface Manhwa {
  id: string;
  title: string;
  description: string;
  author: string;
  artist: string;
  status: string;
  genres: string[]; // নতুন ফিল্ড
  coverImageRef: string | null;
  coverImageUrl: string | null;
  createdAt: number;
  updatedAt: number;
}
