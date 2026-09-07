import { db } from '../../database/db';
import type { ActivityLog } from '../models/ActivityLog';

export async function logActivity(input: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
  await db.activityLog.add({
    id: crypto.randomUUID(),
    ...input,
    timestamp: Date.now(),
  });

  // Keep only last 100 activities to save space
  const allLogs = await db.activityLog.toArray();
  if (allLogs.length > 100) {
    const sorted = allLogs.sort((a, b) => b.timestamp - a.timestamp);
    const toDelete = sorted.slice(100).map(l => l.id);
    await db.activityLog.bulkDelete(toDelete);
  }
}

export async function getRecentActivities(limit = 10): Promise<ActivityLog[]> {
  const all = await db.activityLog.toArray();
  return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

export async function getChaptersReadToday(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();
  
  const activities = await db.activityLog.toArray();
  return activities.filter(log => log.type === 'READ_CHAPTER' && log.timestamp >= todayTimestamp).length;
}

export async function getChaptersReadThisWeek(): Promise<number> {
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const activities = await db.activityLog.toArray();
  return activities.filter(log => log.type === 'READ_CHAPTER' && log.timestamp >= weekAgo).length;
}

export async function getReadingStreak(): Promise<number> {
  const activities = await db.activityLog.toArray();
  const readActivities = activities.filter(a => a.type === 'READ_CHAPTER').sort((a, b) => a.timestamp - b.timestamp);
  
  if (readActivities.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let checkDate = new Date(today);
  
  while (true) {
    const dayStart = checkDate.getTime();
    const dayEnd = dayStart + (24 * 60 * 60 * 1000);
    
    const hasActivity = readActivities.some(a => a.timestamp >= dayStart && a.timestamp < dayEnd);
    
    if (hasActivity) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export async function getGenreDistribution(): Promise<{ genre: string; count: number }[]> {
  const manhwas = await db.manhwa.toArray();
  const genreCount: Record<string, number> = {};
  
  for (const m of manhwas) {
    if (m.genres && m.genres.length > 0) {
      for (const g of m.genres) {
        genreCount[g] = (genreCount[g] || 0) + 1;
      }
    }
  }
  
  return Object.entries(genreCount)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export async function getReadingActivityHeatmap(): Promise<{ date: string; count: number }[]> {
  const activities = await db.activityLog.toArray();
  const readActivities = activities.filter(a => a.type === 'READ_CHAPTER');
  
  const last30Days: { date: string; count: number }[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dayStart = d.getTime();
    const dayEnd = dayStart + (24 * 60 * 60 * 1000);
    
    const count = readActivities.filter(a => a.timestamp >= dayStart && a.timestamp < dayEnd).length;
    last30Days.push({
      date: d.toISOString().split('T')[0],
      count,
    });
  }
  
  return last30Days;
}
