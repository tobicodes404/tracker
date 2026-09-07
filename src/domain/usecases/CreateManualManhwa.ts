import { db } from '../../database/db';
import { ImageStorageService } from '../../services/images/ImageStorageService';
import type { CharacterFavorite } from '../models/PersonalMetadata';

export interface CreateManualManhwaInput {
  title: string;
  description?: string;
  author?: string;
  artist?: string;
  status?: string;
  genres?: string[];
  coverFile?: File | null;
  isAdult?: boolean;
  
  // Advanced ratings
  storyRating?: number | null;
  artRating?: number | null;
  characterRating?: number | null;
  enjoymentRating?: number | null;
  
  // Character favorites (with images)
  favoriteMaleCharacters?: CharacterFavorite[];
  favoriteFemaleCharacters?: CharacterFavorite[];
}

export async function createManualManhwa(input: CreateManualManhwaInput): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  
  let coverImageRef: string | null = null;
  if (input.coverFile) {
    coverImageRef = await ImageStorageService.saveLocalFile(input.coverFile);
  }

  // Process character images
  const processCharacters = async (chars: CharacterFavorite[] = []): Promise<CharacterFavorite[]> => {
    const result: CharacterFavorite[] = [];
    for (const char of chars) {
      if (char.imageFile) {
        const imageRef = await ImageStorageService.saveLocalFile(char.imageFile);
        result.push({ name: char.name, imageRef });
      } else {
        result.push({ name: char.name, imageRef: null });
      }
    }
    return result;
  };

  const maleChars = await processCharacters(input.favoriteMaleCharacters);
  const femaleChars = await processCharacters(input.favoriteFemaleCharacters);

  await db.manhwa.add({
    id,
    title: input.title,
    description: input.description || '',
    author: input.author || '',
    artist: input.artist || '',
    status: input.status || 'UNKNOWN',
    genres: input.genres || [],
    coverImageRef,
    coverImageUrl: null,
    createdAt: now,
    updatedAt: now,
  });
  
  await db.personalMetadata.add({
    manhwaId: id,
    rating: null,
    storyRating: input.storyRating ?? null,
    artRating: input.artRating ?? null,
    characterRating: input.characterRating ?? null,
    enjoymentRating: input.enjoymentRating ?? null,
    notes: '',
    isFavorite: false,
    personalTags: [],
    favoriteMaleCharacters: maleChars,
    favoriteFemaleCharacters: femaleChars,
    isAdult: input.isAdult ?? false,
    isLocked: false,
  });
  
  await db.readingProgress.add({
    manhwaId: id,
    currentChapter: null,
    lastReadTime: null,
    completionTime: null,
    status: 'PLAN_TO_READ',
  });
  
  return id;
}
