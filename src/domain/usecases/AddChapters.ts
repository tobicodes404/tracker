import { db } from '../../database/db';

export interface AddChapterInput {
  manhwaId: string;
  chapterNumber: string;
  title?: string;
}

export async function addChapters(inputs: AddChapterInput[]): Promise<{ added: number, skipped: number }> {
  if (inputs.length === 0) return { added: 0, skipped: 0 };

  const manhwaId = inputs[0].manhwaId;
  
  // আগে থেকে থাকা চ্যাপ্টারগুলোর chapterNumber চেক করা
  const existingChapters = await db.chapters
    .where('manhwaId')
    .equals(manhwaId)
    .toArray();
  
  const existingNumbers = new Set(existingChapters.map(c => c.chapterNumber));

  const newChapters = [];
  let skippedCount = 0;

  for (const input of inputs) {
    if (existingNumbers.has(input.chapterNumber)) {
      skippedCount++;
      continue; // Duplicate, skip
    }

    newChapters.push({
      id: crypto.randomUUID(),
      manhwaId: input.manhwaId,
      chapterNumber: input.chapterNumber,
      title: input.title || `Chapter ${input.chapterNumber}`,
      volume: null,
      releaseDate: null,
      isRead: false,
      readTimestamp: null,
      sourceUrl: null,
    });
  }

  if (newChapters.length > 0) {
    await db.chapters.bulkAdd(newChapters);
  }

  return { added: newChapters.length, skipped: skippedCount };
}
