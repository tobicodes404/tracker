export interface CharacterFavorite {
  name: string;
  imageRef: string | null;
  imageFile?: File | null;
}

export interface PersonalMetadata {
  manhwaId: string;
  rating: number | null;
  storyRating: number | null;
  artRating: number | null;
  characterRating: number | null;
  enjoymentRating: number | null;
  notes: string;
  isFavorite: boolean;
  isLocked: boolean;
  isAdult: boolean;
  personalTags: string[];
  favoriteMaleCharacters: CharacterFavorite[];
  favoriteFemaleCharacters: CharacterFavorite[];
}
