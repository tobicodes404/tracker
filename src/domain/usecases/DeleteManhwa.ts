import { db } from '../../database/db';
import { ImageStorageService } from '../../services/images/ImageStorageService';

export async function deleteManhwa(manhwaId: string): Promise<void> {
  await db.transaction('rw', db.manhwa, db.chapters, db.personalMetadata, db.readingProgress, db.externalMappings, db.images, async () => {
    // ১. কভার ইমেজ ডিলিট করা (যদি থাকে)
    const manhwa = await db.manhwa.get(manhwaId);
    if (manhwa?.coverImageRef) {
      await ImageStorageService.deleteImage(manhwa.coverImageRef);
    }

    // ২. সম্পর্কিত সব ডেটা ডিলিট করা
    await db.chapters.where('manhwaId').equals(manhwaId).delete();
    await db.personalMetadata.where('manhwaId').equals(manhwaId).delete();
    await db.readingProgress.where('manhwaId').equals(manhwaId).delete();
    await db.externalMappings.where('manhwaId').equals(manhwaId).delete();
    
    // ৩. মূল ম্যানহোয়া রেকর্ড ডিলিট করা
    await db.manhwa.delete(manhwaId);
  });
}
