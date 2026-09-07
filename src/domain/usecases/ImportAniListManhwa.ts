import { db } from '../../database/db';
import { anilistProvider } from '../../integrations/anilist/AniListMetadataProvider';
import { ImageStorageService } from '../../services/images/ImageStorageService';

export async function importAniListManhwa(externalId: string): Promise<string> {
  const existingMapping = await db.externalMappings
    .where('[providerName+externalId]')
    .equals(['anilist', externalId])
    .first();

  if (existingMapping) {
    return existingMapping.manhwaId;
  }

  const details = await anilistProvider.getDetails(externalId);
  const id = crypto.randomUUID();
  const now = Date.now();

  let coverImageRef: string | null = null;
  let coverImageUrl: string | null = null;

  if (details.coverImage) {
    const result = await ImageStorageService.downloadAndSave(details.coverImage);
    coverImageRef = result.localId;
    coverImageUrl = result.remoteUrl;
  }

  await db.transaction('rw', db.manhwa, db.personalMetadata, db.readingProgress, db.externalMappings, async () => {
    await db.manhwa.add({
      id,
      title: details.title,
      description: details.description,
      author: details.author,
      artist: details.artist,
      status: details.status,
      coverImageRef,
      coverImageUrl,
      createdAt: now,
      updatedAt: now,
    });

    await db.personalMetadata.add({
      manhwaId: id,
      rating: null,
      notes: '',
      isFavorite: false,
      personalTags: [],
    });

    await db.readingProgress.add({
      manhwaId: id,
      currentChapter: null,
      lastReadTime: null,
      completionTime: null,
      status: 'PLAN_TO_READ',
    });

    await db.externalMappings.add({
      id: crypto.randomUUID(),
      manhwaId: id,
      providerName: 'anilist',
      externalId: externalId,
    });
  });

  return id;
}
