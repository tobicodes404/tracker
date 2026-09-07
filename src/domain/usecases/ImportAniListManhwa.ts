import { db } from '../../database/db';

export async function importAniListManhwa(externalId: string): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();

  await db.manhwa.add({
    id,
    title: 'Imported Manhwa',
    description: '',
    author: 'Unknown',
    artist: 'Unknown',
    status: 'ONGOING',
    genres: [],
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
    isLocked: false,
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
