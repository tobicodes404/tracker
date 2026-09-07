import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../database/db';
import { CoverImage } from '../../components/manhwa/CoverImage';
import { verifyCategoryPassword } from '../../domain/usecases/categories/ManageCategories';

export function CategoryViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');

  const category = useLiveQuery(() => (id ? db.customCategories.get(id) : undefined), [id]);

  // ক্যাটাগরির সব ম্যানহোয়া ফেচ করা
  const manhwas = useLiveQuery(async () => {
    if (!category || !isUnlocked) return [];
    if (category.manhwaIds.length === 0) return [];
    return await db.manhwa.where('id').anyOf(category.manhwaIds).toArray();
  }, [category, isUnlocked]);

  if (!category) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">Category not found.</div>;
  }

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const isValid = await verifyCategoryPassword(id!, passwordInput);
    if (isValid) {
      setIsUnlocked(true);
    } else {
      setError('Incorrect password.');
    }
  };

  // যদি পাসওয়ার্ড প্রোটেক্টেড হয় এবং আনলক না হয়, তবে পাসওয়ার্ড ফর্ম দেখাও
  if (category.isPasswordProtected && !isUnlocked) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4">
        <div className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center text-3xl mb-4`}>
          {category.icon || ''}
        </div>
        <h1 className="text-xl font-bold mb-2">{category.name}</h1>
        <p className="text-sm text-neutral-400 mb-6">This category is password protected.</p>
        
        <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-3">
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
            placeholder="Enter password"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium">Unlock</button>
          <button type="button" onClick={() => navigate(-1)} className="w-full text-neutral-400 text-sm py-2">Go Back</button>
        </form>
      </div>
    );
  }

  // আনলক হওয়ার পর বা পাবলিক ক্যাটাগরির জন্য লিস্ট দেখাও
  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-24">
      <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 p-4 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-blue-500 font-medium">← Back</button>
        <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center text-sm`}>
          {category.icon || ''}
        </div>
        <h1 className="text-xl font-bold">{category.name}</h1>
      </div>

      <div className="p-4">
        {manhwas && manhwas.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <p className="text-sm">No manhwa in this category yet.</p>
            <button onClick={() => navigate('/library')} className="mt-3 text-blue-500 text-sm hover:underline">Browse Library</button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {manhwas?.map(item => (
              <div key={item.id} onClick={() => navigate(`/details/${item.id}`)} className="cursor-pointer group">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-neutral-800 shadow-md mb-2 relative">
                  <CoverImage imageRef={item.coverImageRef} imageUrl={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                </div>
                <h3 className="text-xs font-medium text-neutral-200 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors min-h-[2rem]">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
