import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../database/db';
import { updateManhwaDetails } from '../../domain/usecases/UpdateManhwaDetails';
import { updatePersonalMetadata } from '../../domain/usecases/UpdatePersonalMetadata';
import { updateReadingProgress } from '../../domain/usecases/UpdateReadingProgress';
import { ImageStorageService } from '../../services/images/ImageStorageService';
import type { CharacterFavorite } from '../../domain/models/PersonalMetadata';
import type { ReadingStatus } from '../../domain/models/ReadingStatus';

const statusOptions = [
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'HIATUS', label: 'Hiatus' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'UNKNOWN', label: 'Unknown' },
];

const readingStatusOptions: { value: ReadingStatus; label: string }[] = [
  { value: 'READING', label: 'Reading' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'DROPPED', label: 'Dropped' },
  { value: 'PLAN_TO_READ', label: 'Plan to Read' },
];

export function EditManhwaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const manhwa = useLiveQuery(() => (id ? db.manhwa.get(id) : undefined), [id]);
  const personalData = useLiveQuery(() => (id ? db.personalMetadata.get(id) : undefined), [id]);
  const progressData = useLiveQuery(() => (id ? db.readingProgress.get(id) : undefined), [id]);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    artist: '',
    status: 'UNKNOWN',
    genres: '',
    description: '',
    readingStatus: 'PLAN_TO_READ' as ReadingStatus,
    rating: '' as string | number,
    storyRating: 0,
    artRating: 0,
    characterRating: 0,
    enjoymentRating: 0,
    notes: '',
    isFavorite: false,
    isAdult: false,
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  const [maleCharacters, setMaleCharacters] = useState<CharacterFavorite[]>([]);
  const [femaleCharacters, setFemaleCharacters] = useState<CharacterFavorite[]>([]);
  const [newMaleChar, setNewMaleChar] = useState('');
  const [newFemaleChar, setNewFemaleChar] = useState('');

  useEffect(() => {
    if (manhwa && personalData && progressData) {
      setFormData({
        title: manhwa.title,
        author: manhwa.author || '',
        artist: manhwa.artist || '',
        status: manhwa.status || 'UNKNOWN',
        genres: (manhwa.genres || []).join(', '),
        description: manhwa.description || '',
        readingStatus: progressData.status,
        rating: personalData.rating || '',
        storyRating: personalData.storyRating || 0,
        artRating: personalData.artRating || 0,
        characterRating: personalData.characterRating || 0,
        enjoymentRating: personalData.enjoymentRating || 0,
        notes: personalData.notes || '',
        isFavorite: personalData.isFavorite || false,
        isAdult: personalData.isAdult || false,
      });
      setMaleCharacters(personalData.favoriteMaleCharacters || []);
      setFemaleCharacters(personalData.favoriteFemaleCharacters || []);
    }
  }, [manhwa, personalData, progressData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setRemoveCover(false);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const addMaleCharacter = () => {
    if (newMaleChar.trim() && !maleCharacters.find(c => c.name === newMaleChar.trim())) {
      setMaleCharacters([...maleCharacters, { name: newMaleChar.trim(), imageRef: null }]);
      setNewMaleChar('');
    }
  };

  const addFemaleCharacter = () => {
    if (newFemaleChar.trim() && !femaleCharacters.find(c => c.name === newFemaleChar.trim())) {
      setFemaleCharacters([...femaleCharacters, { name: newFemaleChar.trim(), imageRef: null }]);
      setNewFemaleChar('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !manhwa) return;

    setIsLoading(true);
    try {
      const genresArray = formData.genres.split(',').map(g => g.trim()).filter(g => g.length > 0);

      await updateManhwaDetails({
        id,
        title: formData.title,
        author: formData.author,
        artist: formData.artist,
        status: formData.status,
        genres: genresArray,
        description: formData.description,
        newCoverFile: coverFile,
        removeCover: removeCover,
      });

      await updatePersonalMetadata({
        manhwaId: id,
        rating: formData.rating === '' ? null : Number(formData.rating),
        storyRating: formData.storyRating || null,
        artRating: formData.artRating || null,
        characterRating: formData.characterRating || null,
        enjoymentRating: formData.enjoymentRating || null,
        notes: formData.notes,
        isFavorite: formData.isFavorite,
        isAdult: formData.isAdult,
        favoriteMaleCharacters: maleCharacters,
        favoriteFemaleCharacters: femaleCharacters,
      });

      await updateReadingProgress({
        manhwaId: id,
        status: formData.readingStatus,
      });

      navigate(`/details/${id}`);
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!manhwa || !personalData || !progressData) {
    return <div className="p-4 text-neutral-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 p-4 z-10">
        <button onClick={() => navigate(-1)} className="text-blue-500 font-medium">← Back</button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Cover */}
        <div className="flex flex-col items-center space-y-3">
          <div onClick={() => fileInputRef.current?.click()} className="w-32 h-48 bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-600 flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition-colors">
            {coverPreview ? (
              <img src={coverPreview} alt="New" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-2">
                <div className="text-3xl mb-1 text-neutral-500">📷</div>
                <div className="text-xs text-neutral-500">Tap to change</div>
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
          <div className="flex gap-3">
            {coverFile && <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }} className="text-xs text-blue-400">Cancel Change</button>}
            {(manhwa.coverImageRef || manhwa.coverImageUrl) && !coverFile && (
              <button type="button" onClick={() => setRemoveCover(true)} className={`text-xs ${removeCover ? 'text-red-400 font-bold' : 'text-neutral-400'}`}>
                {removeCover ? 'Will Remove' : 'Remove Cover'}
              </button>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Title *</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Author</label>
              <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Artist</label>
              <input type="text" value={formData.artist} onChange={(e) => setFormData({ ...formData, artist: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500">
              {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Genres</label>
            <input type="text" value={formData.genres} onChange={(e) => setFormData({ ...formData, genres: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="Action, Fantasy (comma separated)" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none" />
          </div>
        </div>

        {/* Reading Status */}
        <div className="border-t border-neutral-800 pt-4 space-y-4">
          <h3 className="font-semibold text-neutral-300">Your Progress</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Reading Status</label>
            <select value={formData.readingStatus} onChange={(e) => setFormData({ ...formData, readingStatus: e.target.value as ReadingStatus })} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500">
              {readingStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Advanced Ratings */}
        <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 space-y-4">
          <h3 className="font-semibold text-neutral-300">Ratings (1-10)</h3>
          {[
            { key: 'storyRating', label: 'Story', icon: '📖' },
            { key: 'artRating', label: 'Art', icon: '🎨' },
            { key: 'characterRating', label: 'Characters', icon: '👥' },
            { key: 'enjoymentRating', label: 'Enjoyment', icon: '😊' },
          ].map((r) => (
            <div key={r.key}>
              <label className="flex justify-between text-sm mb-1">
                <span>{r.icon} {r.label}</span>
                <span className="text-blue-400 font-bold">{formData[r.key as keyof typeof formData] || '-'}/10</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData[r.key as keyof typeof formData] as number}
                onChange={(e) => setFormData({...formData, [r.key]: Number(e.target.value)})}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Character Favorites */}
        <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 space-y-4">
          <h3 className="font-semibold text-neutral-300">Favorite Characters</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-blue-400">♂️ Male Characters</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newMaleChar} onChange={(e) => setNewMaleChar(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMaleCharacter())} className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Character name..." />
              <button type="button" onClick={addMaleCharacter} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {maleCharacters.map((char, i) => (
                <span key={i} className="bg-blue-900/30 text-blue-400 border border-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  {char.name}
                  <button type="button" onClick={() => setMaleCharacters(maleCharacters.filter((_, idx) => idx !== i))} className="hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-pink-400">♀️ Female Characters</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newFemaleChar} onChange={(e) => setNewFemaleChar(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFemaleCharacter())} className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500" placeholder="Character name..." />
              <button type="button" onClick={addFemaleCharacter} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg text-sm font-medium">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {femaleCharacters.map((char, i) => (
                <span key={i} className="bg-pink-900/30 text-pink-400 border border-pink-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  {char.name}
                  <button type="button" onClick={() => setFemaleCharacters(femaleCharacters.filter((_, idx) => idx !== i))} className="hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Notes & Favorite */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Personal Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="fav" checked={formData.isFavorite} onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })} className="w-5 h-5 rounded border-neutral-700 bg-neutral-800 text-blue-500" />
            <label htmlFor="fav" className="text-sm font-medium">Mark as Favorite</label>
          </div>
          <div className="flex items-center justify-between bg-red-900/20 border border-red-800 p-3 rounded-lg">
            <div>
              <div className="font-medium text-red-400 text-sm">18+ Adult Content</div>
            </div>
            <button type="button" onClick={() => setFormData({...formData, isAdult: !formData.isAdult})} className={`w-12 h-6 rounded-full transition-colors relative ${formData.isAdult ? 'bg-red-600' : 'bg-neutral-600'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isAdult ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg font-bold text-lg disabled:opacity-50 transition-colors shadow-lg">
          {isLoading ? 'Saving...' : '💾 Save All Changes'}
        </button>
      </form>
    </div>
  );
}
