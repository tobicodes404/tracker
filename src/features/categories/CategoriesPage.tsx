import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../database/db';
import { createCustomCategory, deleteCustomCategory } from '../../domain/usecases/categories/ManageCategories';

const COLORS = [
  { name: 'Red', class: 'bg-red-500' },
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Green', class: 'bg-green-500' },
  { name: 'Purple', class: 'bg-purple-500' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Pink', class: 'bg-pink-500' },
];

const ICONS = ['📁', '❤️', '🔥', '⭐', '🔞', '', '📚', '✨'];

export function CategoriesPage() {
  const navigate = useNavigate();
  const categories = useLiveQuery(() => db.customCategories.toArray(), []);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].class);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await createCustomCategory(newCatName, selectedColor, selectedIcon, hasPassword, password);
      setNewCatName(''); setPassword(''); setHasPassword(false); setIsCreating(false);
    } catch (err) {
      console.error('Failed to create category:', err);
      alert('Failed to create category.');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    if (window.confirm('Delete this category?')) {
      await deleteCustomCategory(id);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-24">
      <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 p-4 z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-blue-500 font-medium">← Back</button>
        <h1 className="text-xl font-bold">Custom Categories</h1>
      </div>

      <div className="p-4 space-y-6">
        {!isCreating ? (
          <button onClick={() => setIsCreating(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
             Create New Category
          </button>
        ) : (
          <form onSubmit={handleCreate} className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Category Name *</label>
              <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="e.g., My Favorites" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c.name} type="button" onClick={() => setSelectedColor(c.class)} className={`w-8 h-8 rounded-full ${c.class} ${selectedColor === c.class ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-800' : ''}`} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map((icon, i) => (
                  <button key={i} type="button" onClick={() => setSelectedIcon(icon)} className={`w-10 h-10 rounded-lg bg-neutral-900 border ${selectedIcon === icon ? 'border-blue-500' : 'border-neutral-700'} flex items-center justify-center text-xl`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-lg">
              <div>
                <div className="font-medium text-sm">Password Protect</div>
                <div className="text-xs text-neutral-500">Require password to view</div>
              </div>
              <button type="button" onClick={() => setHasPassword(!hasPassword)} className={`w-12 h-6 rounded-full transition-colors relative ${hasPassword ? 'bg-blue-600' : 'bg-neutral-600'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${hasPassword ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            {hasPassword && (
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" placeholder="Set password" />
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2.5 rounded-lg font-medium">Cancel</button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium">Save</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-neutral-300">Your Categories</h2>
          {categories && categories.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center py-4">No custom categories yet.</p>
          ) : (
            categories?.map(cat => (
              <div key={cat.id} onClick={() => navigate(`/category/${cat.id}`)} className="bg-neutral-800 p-3 rounded-xl border border-neutral-700 flex items-center justify-between cursor-pointer hover:bg-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center text-xl`}>{cat.icon}</div>
                  <div>
                    <div className="font-medium">{cat.name}</div>
                    <div className="text-xs text-neutral-500">{cat.manhwaIds.length} manhwa • {cat.isPasswordProtected ? ' Protected' : '🔓 Public'}</div>
                  </div>
                </div>
                <button onClick={(e) => handleDelete(e, cat.id)} className="text-red-400 hover:text-red-300 p-2">🗑️</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
