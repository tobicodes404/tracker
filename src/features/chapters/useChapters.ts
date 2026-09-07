import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../database/db';
import { parseChapterNumber } from '../../domain/models/ChapterNumberParser';
import { compareChapterNumbers } from '../../domain/models/ChapterNumberComparator';
import type { Chapter } from '../../domain/models/Chapter';

export function useChapters(manhwaId: string) {
  const chapters = useLiveQuery(
    (): Promise<Chapter[]> => {
      if (!manhwaId) return Promise.resolve([] as Chapter[]);
      return db.chapters.where('manhwaId').equals(manhwaId).toArray();
    },
    [manhwaId]
  );

  if (!chapters) {
    return { chapters: [] as Chapter[], isLoading: true };
  }

  const sortedChapters = [...chapters].sort((a, b) => {
    const numA = parseChapterNumber(a.chapterNumber);
    const numB = parseChapterNumber(b.chapterNumber);
    return compareChapterNumbers(numA, numB);
  });

  return { chapters: sortedChapters, isLoading: false };
}
