import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../database/db';
import { CoverImage } from '../../components/manhwa/CoverImage';
import { 
  getChaptersReadToday, getChaptersReadThisWeek, getReadingStreak, 
  getGenreDistribution, getReadingActivityHeatmap, getRecentActivities 
} from '../../domain/usecases/LogActivity';
import { useState, useEffect } from 'react';
import type { ActivityLog } from '../../domain/models/ActivityLog';

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalManhwa: 0, totalChaptersRead: 0, chaptersToday: 0, chaptersWeek: 0, streak: 0, avgRating: 0 });
  const [genreData, setGenreData] = useState<{ genre: string; count: number }[]>([]);
  const [_heatmap, setHeatmap] = useState<{ date: string; count: number }[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const weeklyGoal = 20;

  const readingManhwas = useLiveQuery(async () => {
    const progresses = await db.readingProgress.toArray();
    const results = [];
    for (const p of progresses) {
      if (p.status === 'READING' && p.manhwaId) {
        const manhwa = await db.manhwa.get(p.manhwaId);
        if (manhwa) {
          const chapters = await db.chapters.where('manhwaId').equals(p.manhwaId).toArray();
          const readChapters = chapters.filter(c => c.isRead).sort((a, b) => b.chapterNumber.localeCompare(a.chapterNumber, undefined, { numeric: true }));
          results.push({ ...manhwa, progress: p, lastReadChapter: readChapters[0], totalChapters: chapters.length });
        }
      }
    }
    return results;
  }, []);


  useEffect(() => {
    const loadStats = async () => {
      const allManhwas = await db.manhwa.toArray();
      const allChapters = await db.chapters.toArray();
      const allMetas = await db.personalMetadata.toArray();
      setStats({
        totalManhwa: allManhwas.length,
        totalChaptersRead: allChapters.filter(c => c.isRead).length,
        chaptersToday: await getChaptersReadToday(),
        chaptersWeek: await getChaptersReadThisWeek(),
        streak: await getReadingStreak(),
        avgRating: allMetas.filter(m => m.rating != null).reduce((a, b) => a + (b.rating || 0), 0) / (allMetas.filter(m => m.rating != null).length || 1)
      });
      setGenreData(await getGenreDistribution());
      setHeatmap(await getReadingActivityHeatmap());
      setRecentActivities(await getRecentActivities(8));
    };
    loadStats();
  }, []);

  const maxGenreCount = Math.max(...genreData.map(g => g.count), 1);
  // Heatmap max calculated inline
  const weekProgress = Math.min((stats.chaptersWeek / weeklyGoal) * 100, 100);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = { READ_CHAPTER: '📖', ADD_MANHWA: '➕', FAVORITE: '⭐', ADD_CATEGORY: '📁', COMPLETE_MANHWA: '🏆' };
    return icons[type] || '📌';
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-24">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-blue-950/50 via-neutral-950 to-neutral-950 border-b border-white/5 p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-xs text-neutral-400 mt-1">Welcome back, Reader!</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Today</div>
            <div className="text-sm font-medium text-neutral-200">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Library', value: stats.totalManhwa, sub: 'Total Manhwa', icon: '📚', color: 'text-blue-400' },
            { label: 'Read', value: stats.totalChaptersRead, sub: 'Total Chapters', icon: '📖', color: 'text-green-400' },
            { label: 'Streak', value: stats.streak, sub: `Day${stats.streak !== 1 ? 's' : ''}`, icon: '🔥', color: 'text-orange-400' },
            { label: 'Avg Rating', value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-', sub: 'Your Average', icon: '⭐', color: 'text-yellow-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-neutral-900/80 backdrop-blur border border-white/5 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{stat.icon}</span>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">{stat.label}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Add', icon: '➕', action: () => navigate('/add'), bg: 'bg-blue-600 hover:bg-blue-500' },
              { label: 'Library', icon: '📚', action: () => navigate('/library'), bg: 'bg-neutral-900 hover:bg-neutral-800 border border-white/5' },
              { label: 'Vault', icon: '🔒', action: () => navigate('/library'), bg: 'bg-neutral-900 hover:bg-neutral-800 border border-white/5' },
              { label: 'Settings', icon: '⚙️', action: () => navigate('/settings'), bg: 'bg-neutral-900 hover:bg-neutral-800 border border-white/5' },
            ].map((item, i) => (
              <button key={i} onClick={item.action} className={`${item.bg} p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all active:scale-95`}>
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-medium text-neutral-200">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="bg-gradient-to-r from-green-950/40 to-emerald-950/40 border border-green-500/20 p-4 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-semibold text-sm text-green-100">🎯 Weekly Goal</h3>
              <p className="text-xs text-green-400/70">Read {weeklyGoal} chapters this week</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-400">{stats.chaptersWeek}<span className="text-neutral-500 text-sm">/{weeklyGoal}</span></div>
              <div className="text-[10px] text-neutral-500">{Math.round(weekProgress)}% complete</div>
            </div>
          </div>
          <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-white/5">
            <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${weekProgress}%` }} />
          </div>
        </div>

        {/* Continue Reading */}
        {readingManhwas && readingManhwas.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">📖 Continue Reading</h2>
              <button onClick={() => navigate('/library')} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View All →</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {readingManhwas.map(item => (
                <div key={item.id} onClick={() => navigate(`/details/${item.id}`)} className="flex-shrink-0 w-28 cursor-pointer group">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 shadow-lg mb-2 relative ring-1 ring-white/5 group-hover:ring-blue-500/50 transition-all">
                    <CoverImage imageRef={item.coverImageRef} imageUrl={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2">
                      <div className="text-[10px] text-white font-medium truncate">
                        {item.lastReadChapter ? `Ch. ${item.lastReadChapter.chapterNumber}` : 'Start Reading'}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xs font-medium text-neutral-300 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Genre Distribution */}
        {genreData.length > 0 && (
          <div className="premium-card p-4">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><span>📊</span> Genre Distribution</h3>
            <div className="space-y-3">
              {genreData.map((g, i) => (
                <div key={g.genre}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-neutral-300 font-medium">{g.genre}</span>
                    <span className="text-neutral-500">{g.count} titles</span>
                  </div>
                  <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'][i % 6]}`} style={{ width: `${(g.count / maxGenreCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Feed */}
        {recentActivities.length > 0 && (
          <div className="premium-card p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><span>🕒</span> Recent Activity</h3>
            <div className="space-y-1">
              {recentActivities.map(activity => (
                <div key={activity.id} onClick={() => activity.manhwaId && navigate(`/details/${activity.manhwaId}`)} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-neutral-950 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-blue-500/30 transition-colors">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-neutral-200 truncate">{activity.manhwaTitle || 'Activity'}</div>
                    <div className="text-[10px] text-neutral-500 truncate">{activity.details}</div>
                  </div>
                  <div className="text-[10px] text-neutral-600 flex-shrink-0 font-medium">{formatTimeAgo(activity.timestamp)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
