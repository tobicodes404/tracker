import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createManualManhwa } from '../../domain/usecases/CreateManualManhwa';
import { db } from '../../database/db';
import type { CharacterFavorite } from '../../domain/models/PersonalMetadata';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Romance', 
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller', 
  'Mystery', 'Horror', 'Isekai', 'Martial Arts', 'School Life', 
  'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Psychological', 'Historical',
  'Ecchi', 'Mature', 'Smut', 'Harem', 'Yaoi', 'Yuri'
];

const STATUS_OPTIONS = [
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'HIATUS', label: 'Hiatus' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'UNKNOWN', label: 'Unknown' },
];

export function AddManhwaPage() {
  const navigate = useNavigate();
  const coverFileRef = useRef<HTMLInputElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    artist: '',
    status: 'ONGOING',
    description: '',
    isAdult: false,
  });
  
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);

  const [ratings, setRatings] = useState({ story: 0, art: 0, character: 0, enjoyment: 0 });

  const [maleCharacters, setMaleCharacters] = useState<CharacterFavorite[]>([]);
  const [femaleCharacters, setFemaleCharacters] = useState<CharacterFavorite[]>([]);
  const [newMaleChar, setNewMaleChar] = useState('');
  const [newFemaleChar, setNewFemaleChar] = useState('');

  useEffect(() => {
    const loadSuggestions = async () => {
      if (formData.title.length >= 2) {
        const allManhwa = await db.manhwa.toArray();
        const matches = allManhwa
          .filter(m => m.title.toLowerCase().includes(formData.title.toLowerCase()))
          .map(m => m.title)
          .slice(0, 5);
        setTitleSuggestions(matches);
      } else setTitleSuggestions([]);
    };
    loadSuggestions();
  }, [formData.title]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const addMaleCharacter = () => {
    if (newMaleChar.trim() && !maleCharacters.find(c => c.name === newMaleChar.trim())) {
      setMaleCharacters([...maleCharacters, { name: newMaleChar.trim(), imageRef: null, imageFile: null }]);
      setNewMaleChar('');
    }
  };

  const addFemaleCharacter = () => {
    if (newFemaleChar.trim() && !femaleCharacters.find(c => c.name === newFemaleChar.trim())) {
      setFemaleCharacters([...femaleCharacters, { name: newFemaleChar.trim(), imageRef: null, imageFile: null }]);
      setNewFemaleChar('');
    }
  };

  const removeMaleCharacter = (index: number) => {
    setMaleCharacters(maleCharacters.filter((_, i) => i !== index));
  };

  const removeFemaleCharacter = (index: number) => {
    setFemaleCharacters(femaleCharacters.filter((_, i) => i !== index));
  };

  const handleMaleCharImage = (index: number, file: File | null) => {
    setMaleCharacters(prev => prev.map((c, i) => i === index ? { ...c, imageFile: file } : c));
  };

  const handleFemaleCharImage = (index: number, file: File | null) => {
    setFemaleCharacters(prev => prev.map((c, i) => i === index ? { ...c, imageFile: file } : c));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSaving(true);
    try {
      await createManualManhwa({
        ...formData,
        genres: selectedGenres,
        coverFile,
        storyRating: ratings.story || null,
        artRating: ratings.art || null,
        characterRating: ratings.character || null,
        enjoymentRating: ratings.enjoyment || null,
        favoriteMaleCharacters: maleCharacters,
        favoriteFemaleCharacters: femaleCharacters,
      });
      navigate('/library');
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Error saving manhwa.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-24">
      <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 p-4 z-10">
        <h1 className="text-xl font-bold">Add New Manhwa</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        <div className="flex flex-col items-center space-y-3">
          <div onClick={() => coverFileRef.current?.click()} className="w-32 h-48 bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-600 flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition-colors">
            {coverPreview ? (
              <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-2">
                <div className="text-3xl mb-1 text-neutral-500">📷</div>
                <div className="text-xs text-neutral-500">Tap to upload</div>
              </div>
            )}
          </div>
          <input type="file" ref={coverFileRef} accept="image/*" onChange={handleCoverChange} className="hidden" />
          {coverFile && (
            <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); if(coverFileRef.current) coverFileRef.current.value = ''; }} className="text-xs text-red-400">Remove Image</button>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-1.5 text-neutral-300">Title *</label>
          <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} onFocus={() => setShowTitleSuggestions(true)} onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 200)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="Start typing..." />
          {showTitleSuggestions && titleSuggestions.length > 0 && (
            <div className="absolute z-20 w-full bg-neutral-800 border border-neutral-700 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
              {titleSuggestions.map((title, i) => (
                <button key={i} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setFormData({...formData, title}); setShowTitleSuggestions(false); }} className="w-full text-left px-3 py-2 hover:bg-neutral-700 text-sm">{title}</button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Author</label>
            <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="Author" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-300">Artist</label>
            <input type="text" value={formData.artist} onChange={(e) => setFormData({ ...formData, artist: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="Artist" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-neutral-300">Status</label>
          <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500">
            {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Genres</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(genre => (
              <button key={genre} type="button" onClick={() => toggleGenre(genre)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${selectedGenres.includes(genre) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}>
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-red-900/20 border border-red-800 p-3 rounded-lg">
          <div>
            <div className="font-medium text-red-400 text-sm">18+ Adult Content</div>
            <div className="text-xs text-red-400/70">Mark if contains mature content</div>
          </div>
          <button type="button" onClick={() => setFormData({...formData, isAdult: !formData.isAdult})} className={`w-12 h-6 rounded-full transition-colors relative ${formData.isAdult ? 'bg-red-600' : 'bg-neutral-600'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isAdult ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-neutral-300">Description</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none" placeholder="Brief summary..." />
        </div>

        <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 space-y-4">
          <h3 className="font-semibold text-neutral-300">Ratings (1-10)</h3>
          {[
            { key: 'story', label: 'Story', icon: '📖' },
            { key: 'art', label: 'Art', icon: '🎨' },
            { key: 'character', label: 'Characters', icon: '👥' },
            { key: 'enjoyment', label: 'Enjoyment', icon: '😊' },
          ].map((r) => (
            <div key={r.key}>
              <label className="flex justify-between text-sm mb-1">
                <span>{r.icon} {r.label}</span>
                <span className="text-blue-400 font-bold">{ratings[r.key as keyof typeof ratings] || '-'}/10</span>
              </label>
              <input type="range" min="0" max="10" value={ratings[r.key as keyof typeof ratings]} onChange={(e) => setRatings({...ratings, [r.key]: Number(e.target.value)})} className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
          ))}
        </div>

        <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 space-y-3">
          <h3 className="font-semibold text-blue-400">♂️ Male Characters</h3>
          <div className="flex gap-2">
            <input type="text" value={newMaleChar} onChange={(e) => setNewMaleChar(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMaleCharacter())} className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Character name..." />
            <button type="button" onClick={addMaleCharacter} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium">Add</button>
          </div>
          {maleCharacters.length > 0 && (
            <div className="space-y-2">
              {maleCharacters.map((char, i) => (
                <div key={i} className="flex items-center gap-2 bg-neutral-900 p-2 rounded-lg">
                  <label className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0">
                    {char.imageFile ? <img src={URL.createObjectURL(char.imageFile)} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-neutral-500">+</span>}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMaleCharImage(i, e.target.files?.[0] || null)} />
                  </label>
                  <span className="flex-1 text-sm truncate">{char.name}</span>
                  <button type="button" onClick={() => removeMaleCharacter(i)} className="text-red-400 hover:text-red-300 text-lg">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 space-y-3">
          <h3 className="font-semibold text-pink-400">♀️ Female Characters</h3>
          <div className="flex gap-2">
            <input type="text" value={newFemaleChar} onChange={(e) => setNewFemaleChar(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFemaleCharacter())} className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500" placeholder="Character name..." />
            <button type="button" onClick={addFemaleCharacter} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg text-sm font-medium">Add</button>
          </div>
          {femaleCharacters.length > 0 && (
            <div className="space-y-2">
              {femaleCharacters.map((char, i) => (
                <div key={i} className="flex items-center gap-2 bg-neutral-900 p-2 rounded-lg">
                  <label className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0">
                    {char.imageFile ? <img src={URL.createObjectURL(char.imageFile)} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-neutral-500">+</span>}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFemaleCharImage(i, e.target.files?.[0] || null)} />
                  </label>
                  <span className="flex-1 text-sm truncate">{char.name}</span>
                  <button type="button" onClick={() => removeFemaleCharacter(i)} className="text-red-400 hover:text-red-300 text-lg">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSaving || !formData.title.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg font-bold text-lg disabled:opacity-50 transition-colors shadow-lg">
          {isSaving ? 'Saving...' : '💾 Save Manhwa'}
        </button>
      </form>
    </div>
  );
}
