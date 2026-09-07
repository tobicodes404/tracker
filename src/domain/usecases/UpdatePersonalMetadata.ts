import { db } from '../../database/db';
import type { CharacterFavorite } from '../models/PersonalMetadata';

export interface UpdatePersonalMetadataInput {
  manhwaId: string;
  rating?: number | null;
  storyRating?: number | null;
  artRating?: number | null;
  characterRating?: number | null;
  enjoymentRating?: number | null;
  notes?: string;
  isFavorite?: boolean;
  isAdult?: boolean;
  favoriteMaleCharacters?: CharacterFavorite[];
  favoriteFemaleCharacters?: CharacterFavorite[];
}

export async function updatePersonalMetadata(input: UpdatePersonalMetadataInput): Promise<void> {
  const existing = await db.personalMetadata.get(input.manhwaId);
  if (!existing) throw new Error('Personal metadata not found');

  await db.personalMetadata.update(input.manhwaId, {
    rating: input.rating ?? existing.rating,
    storyRating: input.storyRating ?? existing.storyRating,
    artRating: input.artRating ?? existing.artRating,
    characterRating: input.characterRating ?? existing.characterRating,
    enjoymentRating: input.enjoymentRating ?? existing.enjoymentRating,
    notes: input.notes ?? existing.notes,
    isFavorite: input.isFavorite ?? existing.isFavorite,
    isAdult: input.isAdult ?? existing.isAdult,
    favoriteMaleCharacters: input.favoriteMaleCharacters ?? existing.favoriteMaleCharacters,
    favoriteFemaleCharacters: input.favoriteFemaleCharacters ?? existing.favoriteFemaleCharacters,
  });
}
