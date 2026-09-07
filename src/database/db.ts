import Dexie from 'dexie';
import type { Manhwa } from '../domain/models/Manhwa';
import type { PersonalMetadata } from '../domain/models/PersonalMetadata';
import type { ReadingProgress } from '../domain/models/ReadingProgress';
import type { Chapter } from '../domain/models/Chapter';
import type { ExternalMapping } from '../domain/models/ExternalMapping';
import type { ImageRecord } from '../domain/models/Image';
import type { CustomCategory } from '../domain/models/CustomCategory';
import type { ActivityLog } from '../domain/models/ActivityLog';

export interface ManhwaTrackerDB {
  manhwa: Dexie.Table<Manhwa, string>;
  personalMetadata: Dexie.Table<PersonalMetadata, string>;
  readingProgress: Dexie.Table<ReadingProgress, string>;
  chapters: Dexie.Table<Chapter, string>;
  externalMappings: Dexie.Table<ExternalMapping, string>;
  images: Dexie.Table<ImageRecord, string>;
  customCategories: Dexie.Table<CustomCategory, string>;
  activityLog: Dexie.Table<ActivityLog, string>;
}

export class ManhwaTrackerDB extends Dexie implements ManhwaTrackerDB {
  manhwa!: Dexie.Table<Manhwa, string>;
  personalMetadata!: Dexie.Table<PersonalMetadata, string>;
  readingProgress!: Dexie.Table<ReadingProgress, string>;
  chapters!: Dexie.Table<Chapter, string>;
  externalMappings!: Dexie.Table<ExternalMapping, string>;
  images!: Dexie.Table<ImageRecord, string>;
  customCategories!: Dexie.Table<CustomCategory, string>;
  activityLog!: Dexie.Table<ActivityLog, string>;

  constructor() {
    super('ManhwaTrackerDB');
    
    this.version(1).stores({
      manhwa: 'id, title, createdAt, updatedAt',
      personalMetadata: 'manhwaId, isFavorite',
      readingProgress: 'manhwaId, status, lastReadTime',
      chapters: 'id, manhwaId, chapterNumber, isRead',
      externalMappings: 'id, manhwaId, [providerName+externalId]',
      images: 'id'
    });

    this.version(2).stores({
      manhwa: 'id, title, createdAt, updatedAt, coverImageUrl',
      personalMetadata: 'manhwaId, isFavorite',
      readingProgress: 'manhwaId, status, lastReadTime',
      chapters: 'id, manhwaId, chapterNumber, isRead',
      externalMappings: 'id, manhwaId, [providerName+externalId]',
      images: 'id'
    }).upgrade(tx => {
      return tx.table('manhwa').toCollection().modify(manhwa => {
        manhwa.coverImageUrl = null;
      });
    });

    this.version(3).stores({
      manhwa: 'id, title, createdAt, updatedAt, coverImageUrl',
      personalMetadata: 'manhwaId, isFavorite',
      readingProgress: 'manhwaId, status, lastReadTime',
      chapters: 'id, manhwaId, chapterNumber, isRead',
      externalMappings: 'id, manhwaId, [providerName+externalId]',
      images: 'id',
      customCategories: 'id, name'
    }).upgrade(tx => {
      return tx.table('personalMetadata').toCollection().modify(meta => {
        meta.storyRating = meta.storyRating ?? null;
        meta.artRating = meta.artRating ?? null;
        meta.characterRating = meta.characterRating ?? null;
        meta.enjoymentRating = meta.enjoymentRating ?? null;
        meta.favoriteMaleCharacters = meta.favoriteMaleCharacters ?? [];
        meta.favoriteFemaleCharacters = meta.favoriteFemaleCharacters ?? [];
        meta.isAdult = meta.isAdult ?? false;
      });
    });

    this.version(4).stores({
      manhwa: 'id, title, createdAt, updatedAt, coverImageUrl',
      personalMetadata: 'manhwaId, isFavorite, isLocked',
      readingProgress: 'manhwaId, status, lastReadTime',
      chapters: 'id, manhwaId, chapterNumber, isRead',
      externalMappings: 'id, manhwaId, [providerName+externalId]',
      images: 'id',
      customCategories: 'id, name'
    }).upgrade(tx => {
      return tx.table('personalMetadata').toCollection().modify(meta => {
        meta.isLocked = meta.isLocked ?? false;
      });
    });

    this.version(5).stores({
      manhwa: 'id, title, createdAt, updatedAt, coverImageUrl',
      personalMetadata: 'manhwaId, isFavorite, isLocked',
      readingProgress: 'manhwaId, status, lastReadTime',
      chapters: 'id, manhwaId, chapterNumber, isRead',
      externalMappings: 'id, manhwaId, [providerName+externalId]',
      images: 'id',
      customCategories: 'id, name',
      activityLog: 'id, type, timestamp, manhwaId'
    });
  }
}

export const db = new ManhwaTrackerDB();
