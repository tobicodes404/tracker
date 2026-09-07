export interface MetadataSearchResult {
  externalId: string;
  title: string;
  coverImage: string | null;
}

export interface MetadataDetails {
  externalId: string;
  title: string;
  alternativeTitles: string[];
  description: string;
  author: string;
  artist: string;
  status: string;
  genres: string[];
  chapters: number | null;
  coverImage: string | null;
}

export interface MetadataProvider {
  search(query: string): Promise<MetadataSearchResult[]>;
  getDetails(externalId: string): Promise<MetadataDetails>;
}
