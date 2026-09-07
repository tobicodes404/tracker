import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportBackup } from '../../backup/export/ExportBackup';
import { importBackup } from '../../backup/import/ImportBackup';
import { parseMihonBackup, type ParsedMihonManga } from '../../backup/mihon/MihonBackupService';
import { db } from '../../database/db';

export function BackupPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mihonFileInputRef = useRef<HTMLInputElement>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isMihonImporting, setIsMihonImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mihonPreview, setMihonPreview] = useState<ParsedMihonManga[] | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      await exportBackup();
      setMessage({ type: 'success', text: 'Backup downloaded successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create backup.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);
    
    const result = await importBackup(file);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleMihonFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsMihonImporting(true);
    setMessage(null);
    setMihonPreview(null);

    try {
      const parsedData = await parseMihonBackup(file);
      setMihonPreview(parsedData);
      setMessage({ type: 'success', text: `Successfully parsed ${parsedData.length} manga from backup!` });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to parse backup file.' });
    } finally {
      setIsMihonImporting(false);
    }
  };

  const confirmMihonImport = async () => {
    if (!mihonPreview) return;
    
    setIsMihonImporting(true);
    try {
      let importedCount = 0;
      
      for (const manga of mihonPreview) {
        const existing = await db.manhwa.where('title').equals(manga.title).first();
        if (existing) continue;

        const id = crypto.randomUUID();
        const now = Date.now();

        // URL থেকে টাইটেল বের করা যদি title খালি থাকে
        let displayTitle = manga.title;
        if (!displayTitle || displayTitle === 'Unknown Title') {
          // URL থেকে বের করা: /series/nano-machine/chapter/323 → "Nano Machine"
          const match = manga.lastReadChapterUrl?.match(/\/series\/([^/]+)/);
          if (match) {
            displayTitle = match[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          } else {
            displayTitle = `Imported Manga ${importedCount + 1}`;
          }
        }

        // ১. ম্যানহোয়া সেভ করা
        await db.manhwa.add({
          id,
          title: displayTitle,
          description: manga.description || 'Imported from Mihon/Tachiyomi',
          author: manga.author || 'Unknown',
          artist: manga.artist || 'Unknown',
          status: 'ONGOING',
          genres: [...new Set([...manga.genres, ...manga.categories])],
          coverImageRef: null,
          coverImageUrl: null,
          createdAt: now,
          updatedAt: now,
        });

        await db.personalMetadata.add({
          manhwaId: id,
          rating: null,
          notes: '',
          isFavorite: false,
          personalTags: [],
        });

        // ২. রিডিং প্রোগ্রেস সেভ করা
        await db.readingProgress.add({
          manhwaId: id,
          currentChapter: manga.lastReadChapterUrl ? 'Imported' : null,
          lastReadTime: manga.lastReadTimestamp,
          completionTime: null,
          status: 'READING',
        });

        importedCount++;
      }

      setMessage({ 
        type: 'success', 
        text: `Successfully imported ${importedCount} manga! Note: Cover images and detailed chapter info need to be fetched from sources.` 
      });
      setMihonPreview(null);
      if (mihonFileInputRef.current) mihonFileInputRef.current.value = '';
    } catch (error) {
      console.error("Import error:", error);
      setMessage({ type: 'error', text: 'Failed to save data to database.' });
    } finally {
      setIsMihonImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 p-4 z-10">
        <button onClick={() => navigate(-1)} className="text-blue-500 font-medium">← Back</button>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Backup & Restore</h1>
          <p className="text-sm text-neutral-400">Keep your data safe or migrate from other apps.</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Native Export/Import Section */}
        <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 space-y-4">
          <h2 className="text-lg font-semibold">App Native Backup</h2>
          <div>
            <p className="text-sm text-neutral-400 mb-3">Export or import your data as a ZIP file.</p>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                {isExporting ? 'Creating...' : '📥 Export to ZIP'}
              </button>
              <label className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-3 rounded-lg font-medium cursor-pointer transition-colors text-center flex items-center justify-center">
                {isImporting ? 'Restoring...' : '📤 Restore from ZIP'}
                <input type="file" ref={fileInputRef} accept=".zip" onChange={handleImport} disabled={isImporting} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Mihon/Tachiyomi Import Section */}
        <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 space-y-4">
          <h2 className="text-lg font-semibold text-orange-400">Migrate from Mihon / Tachiyomi</h2>
          <div className="space-y-2">
            <p className="text-sm text-neutral-400">
              Select your <code className="bg-neutral-900 px-1 py-0.5 rounded">.tachibk</code> OR <code className="bg-neutral-900 px-1 py-0.5 rounded">.proto.gz</code> file.
            </p>
            <div className="bg-yellow-900/30 border border-yellow-700 p-3 rounded-lg">
              <p className="text-xs text-yellow-400">
                ⚠️ <strong>Note:</strong> Mihon backups contain reading history but not cover images or detailed chapter info. 
                Titles will be extracted from URLs if missing. You can add covers manually later or search on AniList.
              </p>
            </div>
          </div>
          
          {!mihonPreview ? (
            <label className="w-full bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/50 text-orange-400 py-3 rounded-lg font-medium cursor-pointer transition-colors text-center flex items-center justify-center gap-2">
              {isMihonImporting ? 'Parsing...' : '📂 Select Backup File'}
              <input 
                type="file" 
                ref={mihonFileInputRef} 
                accept=".tachibk,.proto.gz,.gz" 
                onChange={handleMihonFileSelect} 
                disabled={isMihonImporting} 
                className="hidden" 
              />
            </label>
          ) : (
            <div className="space-y-3">
              <div className="bg-neutral-900 p-3 rounded-lg max-h-48 overflow-y-auto text-sm">
                <p className="text-neutral-400 mb-2">Found {mihonPreview.length} manga. Ready to import:</p>
                <ul className="space-y-1">
                  {mihonPreview.slice(0, 5).map((m, i) => {
                    const displayName = m.title && m.title !== 'Unknown Title' ? m.title : 
                      (m.lastReadChapterUrl?.match(/\/series\/([^/]+)/)?.[1].replace(/-/g, ' ') || 'Unknown');
                    return (
                      <li key={i} className="flex justify-between text-neutral-300">
                        <span className="truncate">{displayName}</span>
                        {m.lastReadChapterUrl && <span className="text-green-400 text-xs">Read</span>}
                      </li>
                    );
                  })}
                  {mihonPreview.length > 5 && <li className="text-neutral-500 text-center">...and {mihonPreview.length - 5} more</li>}
                </ul>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setMihonPreview(null); if(mihonFileInputRef.current) mihonFileInputRef.current.value = ''; }}
                  className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmMihonImport}
                  disabled={isMihonImporting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {isMihonImporting ? 'Importing...' : '✅ Confirm Import'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
