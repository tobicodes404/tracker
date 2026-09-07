import { db } from '../../database/db';
import { anilistProvider } from '../../integrations/anilist/AniListMetadataProvider';
import { ImageStorageService } from '../../services/images/ImageStorageService';

export async function refreshMetadata(manhwaId: string): Promise<void> {
  // ১. চেক করো এই Manhwa-র কোনো AniList mapping আছে কিনা
  const mapping = await db.externalMappings
    .where('manhwaId')
    .equals(manhwaId)
    .first();

  if (!mapping || mapping.providerName !== 'anilist') {
    throw new Error('Metadata refresh is only available for AniList imported manhwa.');
  }

  // ২. AniList থেকে লেটেস্ট ডেটা আনো
  const details = await anilistProvider.getDetails(mapping.externalId);

  // ৩. ইমেজ আপডেট করার চেষ্টা করো (যদি নতুন ইমেজ থাকে)
  let coverImageRef: string | null = null;
  let coverImageUrl: string | null = details.coverImage;

  if (details.coverImage) {
    const result = await ImageStorageService.downloadAndSave(details.coverImage);
    coverImageRef = result.localId;
    coverImageUrl = result.remoteUrl;
  }

  // ৪. শুধুমাত্র 'manhwa' টেবিল আপডেট করো (Personal data untouched)
  await db.manhwa.update(manhwaId, {
    title: details.title,
    description: details.description,
    author: details.author,
    artist: details.artist,
    status: details.status,
    coverImageRef,
    coverImageUrl,
    updatedAt: Date.now(),
  });
}
