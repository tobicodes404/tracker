import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../database/db';

export type SortOption = 'TITLE_ASC' | 'TITLE_DESC' | 'LAST_READ' | 'UPDATED';
export type FilterOption = 'ALL' | 'READING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED' | 'PLAN_TO_READ';

export function useLibrary(searchQuery: string, filter: FilterOption, sort: SortOption) {
  const data = useLiveQuery(async () => {
    const manhwas = await db.manhwa.toArray();
    const progresses = await db.readingProgress.toArray();
    const allChapters = await db.chapters.toArray(); 
    const personalMetas = await db.personalMetadata.toArray();

    const progressMap = new Map(progresses.map(p => [p.manhwaId, p]));
    const personalMap = new Map(personalMetas.map(p => [p.manhwaId, p]));
    const chapterMap = new Map<string, { total: number, read: number }>();

    for (const ch of allChapters) {
      const mid = ch.manhwaId;
      if (!mid) continue;
      const count = chapterMap.get(mid) || { total: 0, read: 0 };
      count.total += 1;
      if (ch.isRead === true) count.read += 1;
      chapterMap.set(mid, count);
    }

    // ফিল্টার: লক করা ম্যানহোয়া বাদ দেওয়া
    let result = manhwas
      .filter(m => !personalMap.get(m.id)?.isLocked) 
      .map(m => {
        const counts = chapterMap.get(m.id) || { total: 0, read: 0 };
        return {
          ...m,
          progress: progressMap.get(m.id),
          totalChapters: counts.total,
          readChapters: counts.read,
        };
      });

    if (filter !== 'ALL') {
      result = result.filter(item => item.progress?.status === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => item.title.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      if (sort === 'TITLE_ASC') return a.title.localeCompare(b.title);
      if (sort === 'TITLE_DESC') return b.title.localeCompare(a.title);
      if (sort === 'LAST_READ') {
        const timeA = a.progress?.lastReadTime || 0;
        const timeB = b.progress?.lastReadTime || 0;
        return timeB - timeA;
      }
      if (sort === 'UPDATED') return b.updatedAt - a.updatedAt;
      return 0;
    });

    return result;
  }, [searchQuery, filter, sort]);

  return { libraryItems: data || [] };
}

// লক করা ম্যানহোয়া আনার জন্য আলাদা হুক
export function useLockedLibrary() {
  const data = useLiveQuery(async () => {
    const manhwas = await db.manhwa.toArray();
    const progresses = await db.readingProgress.toArray();
    const allChapters = await db.chapters.toArray(); 
    const personalMetas = await db.personalMetadata.toArray();

    const progressMap = new Map(progresses.map(p => [p.manhwaId, p]));
    const personalMap = new Map(personalMetas.map(p => [p.manhwaId, p]));
    const chapterMap = new Map<string, { total: number, read: number }>();

    for (const ch of allChapters) {
      const mid = ch.manhwaId;
      if (!mid) continue;
      const count = chapterMap.get(mid) || { total: 0, read: 0 };
      count.total += 1;
      if (ch.isRead === true) count.read += 1;
      chapterMap.set(mid, count);
    }

    // শুধু লক করা ম্যানহোয়া
    return manhwas
      .filter(m => personalMap.get(m.id)?.isLocked)
      .map(m => {
        const counts = chapterMap.get(m.id) || { total: 0, read: 0 };
        return {
          ...m,
          progress: progressMap.get(m.id),
          totalChapters: counts.total,
          readChapters: counts.read,
        };
      });
  }, []);

  return { lockedItems: data || [] };
}
