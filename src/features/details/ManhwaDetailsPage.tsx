import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../database/db';
import { useChapters } from '../chapters/useChapters';
import { CoverImage } from '../../components/manhwa/CoverImage';
import { refreshMetadata } from '../../domain/usecases/RefreshMetadata';
import { toggleChapterReadStatus, bulkUpdateChaptersReadStatus } from '../../domain/usecases/UpdateChapterReadStatus';
import { deleteManhwa } from '../../domain/usecases/DeleteManhwa';
import { addManhwaToCategory, removeManhwaFromCategory } from '../../domain/usecases/categories/ManageCategories';
import type { Chapter } from '../../domain/models/Chapter';

export function ManhwaDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { chapters } = useChapters(id || '');
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const chapterListRef = useRef<HTMLDivElement>(null);

  const manhwa = useLiveQuery(() => (id ? db.manhwa.get(id) : undefined), [id]);
  const personalData = useLiveQuery(() => (id ? db.personalMetadata.get(id) : undefined), [id]);
  const progressData = useLiveQuery(() => (id ? db.readingProgress.get(id) : undefined), [id]);
  const mapping = useLiveQuery(() => (id ? db.externalMappings.where('manhwaId').equals(id).first() : undefined), [id]);
  const categories = useLiveQuery(() => db.customCategories.toArray(), []);

  if (!manhwa || !personalData || !progressData) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white"><div className="text-neutral-400">Loading...</div></div>;
  }

  const handleRefresh = async () => {
    if (!id) return;
    setIsRefreshing(true); setRefreshError(null);
    try { await refreshMetadata(id); } 
    catch (error) { setRefreshError(error instanceof Error ? error.message : 'Failed to refresh'); } 
    finally { setIsRefreshing(false); }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('⚠️ Are you sure you want to delete this manhwa completely?')) {
      setIsDeleting(true);
      try { await deleteManhwa(id); navigate('/library'); } 
      catch (error) { alert('Failed to delete.'); } 
      finally { setIsDeleting(false); }
    }
  };

  const handleToggleLock = async () => {
    if (!id || !personalData) return;
    try { await db.personalMetadata.update(id, { isLocked: !personalData.isLocked }); } 
    catch (err) { console.error('Failed to toggle lock', err); }
  };

  const canRefresh = mapping?.providerName === 'anilist';

  const handleToggleRead = async (chapterId: string, currentStatus: boolean) => {
    if (isSelectionMode) return;
    await toggleChapterReadStatus(chapterId, !currentStatus);
  };

  const handleDragStart = (index: number) => {
    setIsDragging(true);
    setDragStartIndex(index);
    const chapterId = (chapters as Chapter[])[index].id;
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) newSet.delete(chapterId);
      else newSet.add(chapterId);
      return newSet;
    });
  };

  const handleDragEnter = (index: number) => {
    if (!isDragging || dragStartIndex === null) return;
    const start = Math.min(dragStartIndex, index);
    const end = Math.max(dragStartIndex, index);
    const newSet = new Set<string>();
    for (let i = start; i <= end; i++) {
      newSet.add((chapters as Chapter[])[i].id);
    }
    setSelectedIds(newSet);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStartIndex(null);
  };

  const selectAll = () => {
    const allIds = new Set((chapters as Chapter[]).map(c => c.id));
    setSelectedIds(allIds);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBulkMarkRead = async () => {
    if (selectedIds.size === 0) return;
    await bulkUpdateChaptersReadStatus(Array.from(selectedIds), true);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkMarkUnread = async () => {
    if (selectedIds.size === 0) return;
    await bulkUpdateChaptersReadStatus(Array.from(selectedIds), false);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
    setIsDragging(false);
  };

  const handleCategoryToggle = async (categoryId: string, isInCategory: boolean) => {
    if (!id) return;
    try {
      if (isInCategory) await removeManhwaFromCategory(categoryId, id);
      else await addManhwaToCategory(categoryId, id);
    } catch (err) { console.error('Category toggle failed', err); }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 p-4 z-10 flex justify-between items-center">
        {isSelectionMode ? (
          <>
            <button onClick={exitSelectionMode} className="text-red-400 font-medium text-sm">Cancel</button>
            <span className="text-sm font-medium text-neutral-300">{selectedIds.size} selected</span>
            <div className="flex gap-2">
              <button onClick={handleBulkMarkUnread} className="text-xs bg-neutral-700 px-2 py-1 rounded">Unread</button>
              <button onClick={handleBulkMarkRead} className="text-xs bg-green-600 px-2 py-1 rounded">Read</button>
            </div>
          </>
        ) : (
          <>
            <button onClick={() => navigate(-1)} className="text-blue-500 font-medium">← Back</button>
            {canRefresh && (
              <button onClick={handleRefresh} disabled={isRefreshing} className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg disabled:opacity-50">
                {isRefreshing ? '...' : '🔄 Refresh'}
              </button>
            )}
          </>
        )}
      </div>

      <div className="p-4 space-y-4">
        {refreshError && <div className="bg-red-900/30 border border-red-700 text-red-300 px-3 py-2 rounded-lg text-sm">{refreshError}</div>}

        <div className="flex gap-4">
          <div className="w-28 h-40 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-800 shadow-lg">
            <CoverImage imageRef={manhwa.coverImageRef} imageUrl={manhwa.coverImageUrl} alt={manhwa.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold mb-1 leading-tight">{manhwa.title}</h1>
            <p className="text-sm text-neutral-400 mb-2">{manhwa.author || 'Unknown Author'}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">{progressData.status.replace('_', ' ')}</span>
              {personalData.isFavorite && <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded">★ Fav</span>}
              {personalData.rating && <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">{personalData.rating}/10</span>}
              {personalData.isLocked && <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded">🔒 Locked</span>}
            </div>
          </div>
        </div>

        <button onClick={() => navigate(`/edit/${id}`)} className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-lg text-sm font-medium transition-colors">
          Edit Details & Progress
        </button>

        <button onClick={handleToggleLock} className={`w-full py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border ${personalData.isLocked ? 'bg-red-900/30 border-red-800 text-red-400 hover:bg-red-900/50' : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'}`}>
          {personalData.isLocked ? '🔒 Locked (Hidden from Library)' : '🔓 Lock Manga (Hide from Library)'}
        </button>

        {categories && categories.length > 0 && (
          <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 space-y-3">
            <h3 className="font-semibold text-neutral-300 text-sm">Add to Categories</h3>
            <div className="space-y-2">
              {categories.map(cat => {
                const isInCategory = cat.manhwaIds.includes(id || '');
                return (
                  <button key={cat.id} onClick={() => handleCategoryToggle(cat.id, isInCategory)} className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors ${isInCategory ? 'bg-blue-900/20 border-blue-800' : 'bg-neutral-900 border-neutral-700 hover:border-neutral-500'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center text-sm`}>{cat.icon || ''}</div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{cat.name}</div>
                        <div className="text-[10px] text-neutral-500">{cat.isPasswordProtected ? '🔒 Protected' : '🔓 Public'}</div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isInCategory ? 'bg-blue-500 border-blue-500' : 'border-neutral-600'}`}>
                      {isInCategory && <span className="text-white text-xs">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {manhwa.description && (
          <div className="bg-neutral-800/50 p-3 rounded-lg">
            <p className="text-neutral-400 text-sm leading-relaxed line-clamp-4">{manhwa.description}</p>
          </div>
        )}

        <div className="border-t border-neutral-800 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Chapters ({(chapters as Chapter[]).length})</h2>
            <div className="flex gap-2">
              {!isSelectionMode && (chapters as Chapter[]).length > 0 && (
                <button onClick={() => setIsSelectionMode(true)} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Select</button>
              )}
              <button onClick={() => navigate(`/chapters/${id}/add`)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium">+ Add</button>
            </div>
          </div>
          
          {(chapters as Chapter[]).length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm"><p>No chapters added yet</p></div>
          ) : (
            <div ref={chapterListRef} className="space-y-2 select-none">
              {isSelectionMode && (
                <div className="flex gap-2 mb-3">
                  <button onClick={selectAll} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-medium">Select All</button>
                  <button onClick={deselectAll} className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-lg text-xs font-medium">Deselect All</button>
                </div>
              )}
              
              {isSelectionMode && (
                <div className="bg-blue-900/20 border border-blue-800 p-2 rounded-lg mb-3">
                  <p className="text-xs text-blue-300 text-center">💡 Click & drag to select multiple chapters</p>
                </div>
              )}

              {(chapters as Chapter[]).map((chapter, index) => {
                const isSelected = selectedIds.has(chapter.id);
                return (
                  <div 
                    key={chapter.id} 
                    onMouseDown={() => isSelectionMode && handleDragStart(index)}
                    onMouseEnter={() => isSelectionMode && handleDragEnter(index)}
                    onMouseUp={() => isSelectionMode && handleDragEnd()}
                    onMouseLeave={() => isDragging && handleDragEnd()}
                    onTouchStart={() => isSelectionMode && handleDragStart(index)}
                    onTouchMove={(e) => {
                      if (!isSelectionMode) return;
                      const touch = e.touches[0];
                      const element = document.elementFromPoint(touch.clientX, touch.clientY);
                      const chapterElement = element?.closest('[data-chapter-index]');
                      if (chapterElement) {
                        const idx = parseInt(chapterElement.getAttribute('data-chapter-index') || '0');
                        handleDragEnter(idx);
                      }
                    }}
                    onTouchEnd={() => isSelectionMode && handleDragEnd()}
                    data-chapter-index={index}
                    onClick={() => !isSelectionMode && handleToggleRead(chapter.id, chapter.isRead)}
                    className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-blue-900/30 border-blue-500 shadow-lg' : chapter.isRead ? 'bg-neutral-800/50 border-neutral-700 opacity-70' : 'bg-neutral-800 border-neutral-700 hover:border-neutral-500'} ${isDragging && isSelected ? 'scale-105' : ''}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isSelectionMode && (
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-neutral-500'}`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm ${chapter.isRead ? 'text-neutral-400 line-through' : 'text-white'}`}>{chapter.chapterNumber}</div>
                      </div>
                    </div>
                    {!isSelectionMode && <div className={`w-3 h-3 rounded-full flex-shrink-0 ${chapter.isRead ? 'bg-green-500' : 'bg-neutral-600'}`}></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-neutral-800 mt-8">
          <button onClick={handleDelete} disabled={isDeleting} className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-400 py-3 rounded-lg text-sm font-medium transition-colors">
            {isDeleting ? 'Deleting...' : '🗑️ Delete Manhwa Completely'}
          </button>
        </div>
      </div>
    </div>
  );
}
