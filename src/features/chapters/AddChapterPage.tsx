import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addChapters, type AddChapterInput } from '../../domain/usecases/AddChapters';

type AddMode = 'single' | 'range' | 'multiple' | 'select';

export function AddChapterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AddMode>('range');
  const [isSaving, setIsSaving] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);

  const [singleNumber, setSingleNumber] = useState('');
  const [singleTitle, setSingleTitle] = useState('');

  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [rangeTitlePrefix, setRangeTitlePrefix] = useState('');

  const [multipleInput, setMultipleInput] = useState('');

  // Select mode
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !singleNumber.trim()) return;
    setIsSaving(true);
    setResultMessage(null);
    try {
      const inputs: AddChapterInput[] = [{
        manhwaId: id,
        chapterNumber: singleNumber.trim(),
        title: singleTitle.trim() || undefined,
      }];
      const result = await addChapters(inputs);
      if (result.added > 0) {
        setResultMessage({ type: 'success', text: `Added chapter ${singleNumber}!` });
        setSingleNumber('');
        setSingleTitle('');
        setTimeout(() => navigate(`/details/${id}`), 800);
      } else {
        setResultMessage({ type: 'warning', text: `Chapter ${singleNumber} already exists!` });
      }
    } catch (error) {
      console.error('Failed to add chapter:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !rangeStart.trim() || !rangeEnd.trim()) return;

    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);

    if (isNaN(start) || isNaN(end) || start > end) {
      alert('Invalid range.');
      return;
    }

    setIsSaving(true);
    setResultMessage(null);
    try {
      const inputs: AddChapterInput[] = [];
      for (let i = start; i <= end; i++) {
        inputs.push({
          manhwaId: id,
          chapterNumber: String(i),
          title: rangeTitlePrefix ? `${rangeTitlePrefix} ${i}` : undefined,
        });
      }
      const result = await addChapters(inputs);
      
      if (result.added > 0 && result.skipped > 0) {
        setResultMessage({ type: 'warning', text: `Added ${result.added}. Skipped ${result.skipped} duplicates.` });
      } else if (result.added > 0) {
        setResultMessage({ type: 'success', text: `Added ${result.added} chapters (${start}-${end})!` });
      } else {
        setResultMessage({ type: 'warning', text: `All chapters already exist!` });
      }
      
      if (result.added > 0) setTimeout(() => navigate(`/details/${id}`), 1500);
    } catch (error) {
      console.error('Failed to add chapters:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMultipleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !multipleInput.trim()) return;

    const numbers = multipleInput.split(/[\n,]/).map(n => n.trim()).filter(n => n.length > 0);

    setIsSaving(true);
    setResultMessage(null);
    try {
      const inputs: AddChapterInput[] = numbers.map(num => ({
        manhwaId: id,
        chapterNumber: num,
        title: undefined,
      }));
      const result = await addChapters(inputs);
      
      if (result.added > 0 && result.skipped > 0) {
        setResultMessage({ type: 'warning', text: `Added ${result.added}. Skipped ${result.skipped} duplicates.` });
      } else if (result.added > 0) {
        setResultMessage({ type: 'success', text: `Added ${result.added} chapters!` });
      } else {
        setResultMessage({ type: 'warning', text: `All chapters already exist!` });
      }
      
      if (result.added > 0) setTimeout(() => navigate(`/details/${id}`), 1500);
    } catch (error) {
      console.error('Failed to add chapters:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || selectedChapters.size === 0) return;

    setIsSaving(true);
    setResultMessage(null);
    try {
      const inputs: AddChapterInput[] = Array.from(selectedChapters).map(num => ({
        manhwaId: id,
        chapterNumber: num,
        title: undefined,
      }));
      const result = await addChapters(inputs);
      
      if (result.added > 0 && result.skipped > 0) {
        setResultMessage({ type: 'warning', text: `Added ${result.added}. Skipped ${result.skipped} duplicates.` });
      } else if (result.added > 0) {
        setResultMessage({ type: 'success', text: `Added ${result.added} chapters!` });
      }
      
      if (result.added > 0) {
        setSelectedChapters(new Set());
        setSelectAll(false);
        setTimeout(() => navigate(`/details/${id}`), 1500);
      }
    } catch (error) {
      console.error('Failed to add chapters:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleChapterSelection = (chapterNum: string) => {
    const newSet = new Set(selectedChapters);
    if (newSet.has(chapterNum)) {
      newSet.delete(chapterNum);
    } else {
      newSet.add(chapterNum);
    }
    setSelectedChapters(newSet);
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedChapters(new Set());
    } else {
      // Generate chapters 1-100 for selection
      const allChapters = new Set(Array.from({ length: 100 }, (_, i) => String(i + 1)));
      setSelectedChapters(allChapters);
    }
    setSelectAll(!selectAll);
  };

  const modes: { key: AddMode; label: string; icon: string }[] = [
    { key: 'range', label: 'Range', icon: '📊' },
    { key: 'select', label: 'Select', icon: '☑️' },
    { key: 'multiple', label: 'Multiple', icon: '' },
    { key: 'single', label: 'Single', icon: '1️⃣' },
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 p-4 z-10">
        <button onClick={() => navigate(-1)} className="text-blue-500 font-medium">← Back</button>
      </div>

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Add Chapters</h1>

        {resultMessage && (
          <div className={`p-3 rounded-lg text-sm mb-4 ${
            resultMessage.type === 'success' ? 'bg-green-900/30 border border-green-700 text-green-400' : 'bg-yellow-900/30 border border-yellow-700 text-yellow-400'
          }`}>
            {resultMessage.type === 'success' ? '✅' : '⚠️'} {resultMessage.text}
          </div>
        )}

        <div className="flex gap-2 p-1 bg-neutral-800 rounded-lg mb-6">
          {modes.map(m => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={`flex-1 py-2.5 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-1 ${
                mode === m.key ? 'bg-blue-600 text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>{m.icon}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {mode === 'range' && (
          <form onSubmit={handleRangeSubmit} className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg">
              <p className="text-xs text-blue-300">💡 Add a range. Duplicates will be automatically skipped.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-neutral-300">Start *</label>
                <input type="number" required value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="1" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-neutral-300">End *</label>
                <input type="number" required value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="20" min="1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Title Prefix (Optional)</label>
              <input type="text" value={rangeTitlePrefix} onChange={(e) => setRangeTitlePrefix(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="e.g., Episode, Ch." />
            </div>
            {rangeStart && rangeEnd && !isNaN(parseInt(rangeStart)) && !isNaN(parseInt(rangeEnd)) && (
              <div className="bg-neutral-800 p-3 rounded-lg text-sm">
                <span className="text-neutral-400">Will add: </span>
                <span className="text-blue-400 font-bold">{Math.max(0, parseInt(rangeEnd) - parseInt(rangeStart) + 1)} chapters</span>
                <span className="text-neutral-400"> ({rangeStart} to {rangeEnd})</span>
              </div>
            )}
            <button type="submit" disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold disabled:opacity-50 transition-colors">
              {isSaving ? 'Adding...' : '🚀 Add Range'}
            </button>
          </form>
        )}

        {mode === 'select' && (
          <form onSubmit={handleSelectSubmit} className="space-y-4">
            <div className="bg-purple-900/20 border border-purple-800 p-3 rounded-lg">
              <p className="text-xs text-purple-300">💡 Click chapters to select/deselect. Use "Select All" to select 1-100.</p>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-neutral-400">Selected: <span className="text-purple-400 font-bold">{selectedChapters.size}</span></span>
              <button
                type="button"
                onClick={handleSelectAll}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectAll ? 'bg-red-600 hover:bg-red-700' : 'bg-neutral-700 hover:bg-neutral-600'
                }`}
              >
                {selectAll ? 'Deselect All' : 'Select All (1-100)'}
              </button>
            </div>

            <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 100 }, (_, i) => {
                  const num = String(i + 1);
                  const isSelected = selectedChapters.has(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => toggleChapterSelection(num)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-lg scale-105'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || selectedChapters.size === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Adding...' : `🚀 Add ${selectedChapters.size} Selected Chapters`}
            </button>
          </form>
        )}

        {mode === 'multiple' && (
          <form onSubmit={handleMultipleSubmit} className="space-y-4">
            <div className="bg-green-900/20 border border-green-800 p-3 rounded-lg">
              <p className="text-xs text-green-300">💡 Separate with commas or new lines. Duplicates will be skipped.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Chapter Numbers *</label>
              <textarea required value={multipleInput} onChange={(e) => setMultipleInput(e.target.value)} rows={4} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none" placeholder="1, 2, 5, 10, 15" />
            </div>
            {multipleInput.trim() && (
              <div className="bg-neutral-800 p-3 rounded-lg text-sm">
                <span className="text-neutral-400">Will add: </span>
                <span className="text-green-400 font-bold">{multipleInput.split(/[\n,]/).map(n => n.trim()).filter(n => n.length > 0).length} chapters</span>
              </div>
            )}
            <button type="submit" disabled={isSaving} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold disabled:opacity-50 transition-colors">
              {isSaving ? 'Adding...' : '🚀 Add Multiple'}
            </button>
          </form>
        )}

        {mode === 'single' && (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Chapter Number *</label>
              <input type="text" required value={singleNumber} onChange={(e) => setSingleNumber(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="e.g., 1, 1.5, Prologue" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Title (Optional)</label>
              <input type="text" value={singleTitle} onChange={(e) => setSingleTitle(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="Chapter title" />
            </div>
            <button type="submit" disabled={isSaving} className="w-full bg-neutral-700 hover:bg-neutral-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 transition-colors">
              {isSaving ? 'Adding...' : 'Add Chapter'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
