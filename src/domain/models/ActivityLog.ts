export interface ActivityLog {
  id: string;
  type: 'READ_CHAPTER' | 'ADD_MANHWA' | 'FAVORITE' | 'ADD_CATEGORY' | 'COMPLETE_MANHWA';
  manhwaId?: string;
  manhwaTitle?: string;
  details?: string;
  timestamp: number;
}
