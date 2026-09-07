export interface ExternalMapping {
  id: string; // UUID
  manhwaId: string; // Indexed
  providerName: string; // e.g., 'anilist', 'mihon'
  externalId: string;
}
