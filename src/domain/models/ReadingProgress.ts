import type { ReadingStatus } from './ReadingStatus';

export interface ReadingProgress {
  manhwaId: string;
  currentChapter: string | null;
  lastReadTime: number | null;
  completionTime: number | null;
  status: ReadingStatus;
}
