import type { MetadataDetails, MetadataSearchResult } from '../../domain/interfaces/MetadataProvider';
import type { AniListMedia } from './AniListDto';

export function mapAniListToSearchResult(media: AniListMedia): MetadataSearchResult {
  return {
    externalId: media.id.toString(),
    title: media.title.english || media.title.romaji || 'Unknown Title',
    coverImage: media.coverImage?.large || null,
  };
}

export function mapAniListToDetails(media: AniListMedia): MetadataDetails {
  const authorEdge = media.staff?.edges.find(e => e.role?.toLowerCase().includes('story') || e.role?.toLowerCase().includes('original'));
  const artistEdge = media.staff?.edges.find(e => e.role?.toLowerCase().includes('art'));

  return {
    externalId: media.id.toString(),
    title: media.title.english || media.title.romaji || 'Unknown Title',
    alternativeTitles: [media.title.romaji, media.title.native].filter(Boolean) as string[],
    description: media.description ? media.description.replace(/<[^>]*>/g, '') : '', // Strip HTML tags
    author: authorEdge?.node.name.full || 'Unknown',
    artist: artistEdge?.node.name.full || authorEdge?.node.name.full || 'Unknown',
    status: media.status || 'UNKNOWN',
    genres: media.genres || [],
    chapters: media.chapters || null,
    coverImage: media.coverImage?.large || null,
  };
}
