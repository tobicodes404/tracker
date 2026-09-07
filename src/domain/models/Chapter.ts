export interface Chapter {
  id: string;
  manhwaId: string;
  chapterNumber: string;
  title?: string;
  volume?: string | null;
  releaseDate?: number | null;
  isRead: boolean;
  readTimestamp: number | null;
  sourceUrl?: string | null;
}
