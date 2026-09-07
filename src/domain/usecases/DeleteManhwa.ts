import { db } from '../../database/db';
import { ImageStorageService } from '../../services/images/ImageStorageService';

export async function deleteManhwa(manhwaId: string): Promise<void> {
  const manhwa = await db.manhwa.get(manhwaId);
  if (manhwa?.coverImageRef) {
    await ImageStorageService.deleteImage(manhwa.coverImageRef);
  }
  await db.chapters.where('manhwaId').equals(manhwaId).delete();
  await db.personalMetadata.where('manhwaId').equals(manhwaId).delete();
  await db.readingProgress.where('manhwaId').equals(manhwaId).delete();
  await db.externalMappings.where('manhwaId').equals(manhwaId).delete();
  await db.manhwa.delete(manhwaId);
}
