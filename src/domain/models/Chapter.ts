export interface Chapter {
  id: string; // UUID
  manhwaId: string; // Indexed for fast lookup
  chapterNumber: string; // Stored as string (e.g., "1", "1.5", "Prologue")
  title: string;
  volume: string | null;
  releaseDate: number | null;
  isRead: boolean;
  readTimestamp: number | null;
  sourceUrl: string | null;
}
