export interface AniListTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
}

export interface AniListMedia {
  id: number;
  title: AniListTitle;
  coverImage: { large: string | null } | null;
  description?: string | null;
  staff?: { edges: { node: { name: { full: string | null } }, role: string }[] } | null;
  status?: string | null;
  genres?: string[] | null;
  chapters?: number | null;
}

export interface AniListSearchResponse {
  data: {
    Page: {
      media: AniListMedia[];
    };
  };
}

export interface AniListDetailsResponse {
  data: {
    Media: AniListMedia;
  };
}
