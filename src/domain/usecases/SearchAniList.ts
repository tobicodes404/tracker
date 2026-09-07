import { anilistProvider } from '../../integrations/anilist/AniListMetadataProvider';
import type { MetadataSearchResult } from '../interfaces/MetadataProvider';

export async function searchAniList(query: string): Promise<MetadataSearchResult[]> {
  if (query.trim().length < 3) return [];
  return await anilistProvider.search(query);
}
