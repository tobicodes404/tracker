import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../database/db';

const DEFAULT_PIN = '1234';

export function SettingsPage() {
  const navigate = useNavigate();
  const [isWiping, setIsWiping] = useState(false);
  
  // PIN State
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPinForm, setShowPinForm] = useState(false);

  // Load current PIN from localStorage
  const getCurrentPin = () => localStorage.getItem('app_pin') || DEFAULT_PIN;

  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    if (currentPin !== getCurrentPin()) {
      setPinMessage({ type: 'error', text: 'Current PIN is incorrect!' });
      return;
    }

    if (newPin.length < 4) {
      setPinMessage({ type: 'error', text: 'PIN must be at least 4 digits.' });
      return;
    }

    if (newPin !== confirmPin) {
      setPinMessage({ type: 'error', text: 'New PINs do not match!' });
      return;
    }

    localStorage.setItem('app_pin', newPin);
    setPinMessage({ type: 'success', text: 'PIN changed successfully!' });
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setShowPinForm(false), 1500);
  };

  const handleWipeDatabase = async () => {
    if (window.confirm('⚠️ WARNING: This will DELETE ALL YOUR DATA. This action CANNOT be undone. Are you absolutely sure?')) {
      if (window.confirm('Final confirmation: Delete EVERYTHING and reset the app?')) {
        setIsWiping(true);
        try {
          await db.delete();
          window.location.reload();
        } catch (err) {
          console.error('Failed to wipe DB:', err);
          alert('Failed to clear database.');
          setIsWiping(false);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <div className="space-y-2">
          <button 
            onClick={() => navigate('/categories')}
            className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 p-4 rounded-xl flex items-center justify-between transition-colors"
          >
            <div className="text-left">
              <div className="font-medium">Custom Categories</div>
              <div className="text-xs text-neutral-400">Create & manage password-protected categories</div>
            </div>
            <span className="text-neutral-500">→</span>
          </button>

          <button 
            onClick={() => navigate('/backup')}
            className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 p-4 rounded-xl flex items-center justify-between transition-colors"
          >
            <div className="text-left">
              <div className="font-medium">Backup & Restore</div>
              <div className="text-xs text-neutral-400">Export, import, or migrate from Mihon</div>
            </div>
            <span className="text-neutral-500">→</span>
          </button>

          {/* Change PIN Button */}
          <button 
            onClick={() => setShowPinForm(!showPinForm)}
            className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 p-4 rounded-xl flex items-center justify-between transition-colors"
          >
            <div className="text-left">
              <div className="font-medium">Change Vault PIN</div>
              <div className="text-xs text-neutral-400">Change the PIN for locked manga</div>
            </div>
            <span className="text-neutral-500">→</span>
          </button>
        </div>

        {/* PIN Change Form */}
        {showPinForm && (
          <form onSubmit={handlePinChange} className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 space-y-3">
            <h3 className="font-semibold text-neutral-300">Change Vault PIN</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Current PIN</label>
              <input
                type="password"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-center tracking-widest"
                placeholder="Enter current PIN"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">New PIN</label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-center tracking-widest"
                placeholder="Enter new PIN (min 4 digits)"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-300">Confirm New PIN</label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-center tracking-widest"
                placeholder="Confirm new PIN"
                maxLength={6}
              />
            </div>

            {pinMessage && (
              <div className={`p-2 rounded-lg text-xs text-center ${
                pinMessage.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
              }`}>
                {pinMessage.text}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowPinForm(false)} className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2.5 rounded-lg font-medium">
                Cancel
              </button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium">
                Save PIN
              </button>
            </div>
          </form>
        )}

        {/* Danger Zone */}
        <div className="pt-6 border-t border-neutral-800">
          <h2 className="text-red-400 font-bold mb-3 text-sm uppercase tracking-wider">Danger Zone</h2>
          <button 
            onClick={handleWipeDatabase}
            disabled={isWiping}
            className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-800 text-red-400 p-4 rounded-xl flex items-center justify-between transition-colors disabled:opacity-50"
          >
            <div className="text-left">
              <div className="font-medium">Delete All Data</div>
              <div className="text-xs text-red-400/70">Factory reset. Clears database completely.</div>
            </div>
            <span className="text-red-400">{isWiping ? '...' : '🗑️'}</span>
          </button>
        </div>

        <div className="pt-8 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 text-center">
            Manhwa Tracker v1.0.0<br/>
            Local-first, Offline-ready.
          </p>
        </div>
      </div>
    </div>
  );
}
