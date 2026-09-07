import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary, useLockedLibrary, type FilterOption, type SortOption } from './useLibrary';
import { CoverImage } from '../../components/manhwa/CoverImage';

const DEFAULT_PIN = '1234';

export function LibraryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('ALL');
  const [sort, setSort] = useState<SortOption>('LAST_READ');
  
  const [showLocked, setShowLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState('');

  const { libraryItems } = useLibrary(searchQuery, filter, sort);
  const { lockedItems } = useLockedLibrary();

  const displayItems = showLocked && isUnlocked ? lockedItems : libraryItems;

  const filterOptions: { value: FilterOption; label: string; icon: string }[] = [
    { value: 'ALL', label: 'All', icon: '📚' },
    { value: 'READING', label: 'Reading', icon: '📖' },
    { value: 'COMPLETED', label: 'Done', icon: '✅' },
    { value: 'PLAN_TO_READ', label: 'Plan', icon: '📅' },
    { value: 'ON_HOLD', label: 'Hold', icon: '⏸️' },
    { value: 'DROPPED', label: 'Drop', icon: '❌' },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'LAST_READ', label: 'Last Read' },
    { value: 'UPDATED', label: 'Recently Added' },
    { value: 'TITLE_ASC', label: 'Title (A-Z)' },
    { value: 'TITLE_DESC', label: 'Title (Z-A)' },
  ];

  const getCurrentPin = () => localStorage.getItem('app_pin') || DEFAULT_PIN;

  const handleUnlock = () => {
    if (pinInput === getCurrentPin()) {
      setIsUnlocked(true);
      setShowLocked(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Wrong PIN!');
    }
  };

  const handleLockToggle = () => {
    if (showLocked) {
      setShowLocked(false);
      setIsUnlocked(false);
      setPinInput('');
    } else {
      setShowLocked(true);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-24">
      <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 p-4 z-10 space-y-3">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{showLocked && isUnlocked ? '🔒 Locked Vault' : '📚 Library'}</h1>
          <button 
            onClick={handleLockToggle}
            className={`p-2.5 rounded-lg transition-colors ${showLocked && isUnlocked ? 'bg-red-600 hover:bg-red-700' : 'bg-neutral-800 hover:bg-neutral-700'}`}
          >
            {showLocked && isUnlocked ? '🔓' : '🔒'}
          </button>
        </div>
        
        {showLocked && !isUnlocked ? (
          <div className="space-y-2">
            <p className="text-sm text-neutral-400">Enter PIN to view locked manga.</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-center tracking-widest text-lg"
                placeholder="••••"
                maxLength={6}
                autoFocus
              />
              <button onClick={handleUnlock} className="bg-blue-600 hover:bg-blue-700 px-4 rounded-lg font-medium">Unlock</button>
            </div>
            {pinError && <p className="text-red-400 text-xs text-center">{pinError}</p>}
          </div>
        ) : (
          <>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 text-sm"
            />
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {filterOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border whitespace-nowrap ${
                    filter === opt.value ? 'bg-blue-600 border-blue-500 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {sortOptions.map(opt => <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>)}
            </select>
          </>
        )}
      </div>

      <div className="p-4">
        {displayItems.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <div className="text-4xl mb-3">{showLocked && isUnlocked ? '🔒' : '📚'}</div>
            <p className="text-sm">{showLocked && isUnlocked ? 'No locked manga.' : 'No manhwa found.'}</p>
            {!showLocked && (
              <button onClick={() => navigate('/add')} className="mt-3 text-blue-500 text-sm hover:underline">
                Add your first manhwa
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {displayItems.map((item) => (
              <div key={item.id} onClick={() => navigate(`/details/${item.id}`)} className="cursor-pointer group">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800 shadow-md mb-2 relative">
                  <CoverImage imageRef={item.coverImageRef} imageUrl={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                  <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-medium text-white">
                    {item.progress?.status === 'READING' ? 'R' : item.progress?.status === 'COMPLETED' ? 'C' : item.progress?.status === 'PLAN_TO_READ' ? 'P' : '•'}
                  </div>
                </div>
                <h3 className="text-xs font-medium text-neutral-200 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors min-h-[2rem]">{item.title}</h3>
                <p className="text-xs text-blue-400 mt-1 font-bold">
                  {item.totalChapters > 0 ? `${item.readChapters || 0}/${item.totalChapters}` : 'No ch'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
