import type { MetadataProvider, MetadataSearchResult, MetadataDetails } from '../../domain/interfaces/MetadataProvider';
import { SEARCH_QUERY, DETAILS_QUERY } from './AniListQueries';
import type { AniListSearchResponse, AniListDetailsResponse } from './AniListDto';
import { mapAniListToSearchResult, mapAniListToDetails } from './AniListMapper';

const API_URL = 'https://graphql.anilist.co';

export class AniListMetadataProvider implements MetadataProvider {
  async search(query: string): Promise<MetadataSearchResult[]> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ query: SEARCH_QUERY, variables: { search: query, type: 'MANGA' } }),
      });

      if (!response.ok) {
        console.error(`AniList API error: ${response.status} ${response.statusText}`);
        throw new Error(`AniList API request failed with status ${response.status}. It might be a temporary server issue.`);
      }
      
      const data: AniListSearchResponse = await response.json();
      return data.data.Page.media.map(mapAniListToSearchResult);
    } catch (error) {
      console.error('Failed to search AniList:', error);
      throw error;
    }
  }

  async getDetails(externalId: string): Promise<MetadataDetails> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ query: DETAILS_QUERY, variables: { id: parseInt(externalId, 10) } }),
      });

      if (!response.ok) {
        console.error(`AniList API error: ${response.status} ${response.statusText}`);
        throw new Error(`AniList API request failed with status ${response.status}.`);
      }
      
      const data: AniListDetailsResponse = await response.json();
      return mapAniListToDetails(data.data.Media);
    } catch (error) {
      console.error('Failed to get AniList details:', error);
      throw error;
    }
  }
}

export const anilistProvider = new AniListMetadataProvider();
