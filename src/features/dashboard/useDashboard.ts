import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../database/db';

export function useDashboard() {
  const totalCount = useLiveQuery(() => db.manhwa.count());
  const readingCount = useLiveQuery(() => db.readingProgress.where('status').equals('READING').count());
  const completedCount = useLiveQuery(() => db.readingProgress.where('status').equals('COMPLETED').count());
  
  return {
    totalCount: totalCount ?? 0,
    readingCount: readingCount ?? 0,
    completedCount: completedCount ?? 0,
  };
}
