import { db } from '../../database/db';
import type { MetadataSearchResult } from '../interfaces/MetadataProvider';

export async function importAniListManhwa(externalId: string): Promise<string> {
  // Note: This is a simplified placeholder. Ensure your actual fetch logic maps genres correctly.
  const id = crypto.randomUUID();
  const now = Date.now();

  await db.manhwa.add({
    id,
    title: 'Imported Manhwa', // Replace with actual fetched title
    description: '',
    author: 'Unknown',
    artist: 'Unknown',
    status: 'ONGOING',
    genres: [], // Added missing field
    coverImageRef: null,
    coverImageUrl: null,
    createdAt: now,
    updatedAt: now,
  });

  await db.personalMetadata.add({
    manhwaId: id,
    rating: null,
    storyRating: null,
    artRating: null,
    characterRating: null,
    enjoymentRating: null,
    notes: '',
    isFavorite: false,
    isLocked: false, // Added missing field
    isAdult: false,
    personalTags: [],
    favoriteMaleCharacters: [],
    favoriteFemaleCharacters: [],
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

  return id;
}
