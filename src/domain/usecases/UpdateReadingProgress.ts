import { db } from '../../database/db';
import type { ReadingStatus } from '../models/ReadingStatus';

export interface UpdateReadingProgressInput {
  manhwaId: string;
  status?: ReadingStatus;
  currentChapter?: string | null;
}

export async function updateReadingProgress(input: UpdateReadingProgressInput): Promise<void> {
  await db.readingProgress.update(input.manhwaId, {
    ...(input.status !== undefined && { status: input.status }),
    ...(input.currentChapter !== undefined && { currentChapter: input.currentChapter }),
    lastReadTime: Date.now(),
  });
}
