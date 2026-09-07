import { db } from '../../database/db';
import { logActivity } from './LogActivity';

export async function toggleChapterReadStatus(chapterId: string, isRead: boolean): Promise<void> {
  await db.chapters.update(chapterId, {
    isRead,
    readTimestamp: isRead ? Date.now() : null,
  });

  if (isRead) {
    const chapter = await db.chapters.get(chapterId);
    if (chapter) {
      const manhwa = await db.manhwa.get(chapter.manhwaId);
      await logActivity({
        type: 'READ_CHAPTER',
        manhwaId: chapter.manhwaId,
        manhwaTitle: manhwa?.title,
        details: `Chapter ${chapter.chapterNumber}`,
      });
    }
  }
}

export async function bulkUpdateChaptersReadStatus(chapterIds: string[], isRead: boolean): Promise<void> {
  const timestamp = isRead ? Date.now() : null;
  
  await db.chapters.where('id').anyOf(chapterIds).modify({
    isRead,
    readTimestamp: timestamp,
  });

  if (isRead) {
    const chapters = await db.chapters.where('id').anyOf(chapterIds).toArray();
    for (const chapter of chapters) {
      const manhwa = await db.manhwa.get(chapter.manhwaId);
      await logActivity({
        type: 'READ_CHAPTER',
        manhwaId: chapter.manhwaId,
        manhwaTitle: manhwa?.title,
        details: `Chapter ${chapter.chapterNumber}`,
      });
    }
  }
}
