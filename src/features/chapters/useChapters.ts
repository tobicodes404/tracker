import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../database/db';
import { parseChapterNumber } from '../../domain/models/ChapterNumberParser';
import { compareChapterNumbers } from '../../domain/models/ChapterNumberComparator';

export function useChapters(manhwaId: string) {
  const chapters = useLiveQuery(
    () => {
      if (!manhwaId) return Promise.resolve([]);
      return db.chapters.where('manhwaId').equals(manhwaId).toArray();
    },
    [manhwaId]
  );

  // যখন পর্যন্ত ডেটা লোড হচ্ছে, তখন chapters undefined থাকে
  if (!chapters) {
    return { chapters: [], isLoading: true };
  }

  const sortedChapters = [...chapters].sort((a, b) => {
    const numA = parseChapterNumber(a.chapterNumber);
    const numB = parseChapterNumber(b.chapterNumber);
    return compareChapterNumbers(numA, numB);
  });

  return { chapters: sortedChapters, isLoading: false };
}
