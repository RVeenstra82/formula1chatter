import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Je bent niet ingelogd.</div>
      </div>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await apiClient.delete('/users/me');
      await logout();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Verwijderen mislukt');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            {user.profilePictureUrl && (
              <img src={user.profilePictureUrl} alt={user.name} className="w-16 h-16 rounded-full mr-4" />
            )}
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-2">Account</h2>
          <p className="text-sm text-gray-600 mb-4">Je kunt je account verwijderen inclusief al je voorspellingen en scores.</p>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
          )}

          {!isConfirming ? (
            <button
              onClick={() => setIsConfirming(true)}
              className="px-4 py-2 rounded-md font-semibold bg-red-600 text-white hover:bg-red-700"
            >
              Verwijder mijn account
            </button>
          ) : (
            <div className="mt-4 p-4 border border-red-200 rounded-md bg-red-50">
              <p className="text-sm text-red-800 mb-2 font-medium">
                Typ ter bevestiging je volledige naam exact zoals hieronder weergegeven en klik daarna op "Bevestig verwijderen". Deze actie kan niet ongedaan worden gemaakt.
              </p>

              <div className="mb-3">
                <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">Te typen naam</p>
                <div className="px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-900 inline-block">
                  {user.name}
                </div>
              </div>

              <label className="block text-sm text-gray-700 mb-1" htmlFor="confirmName">Voer je naam in</label>
              <input
                id="confirmName"
                type="text"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                className="input w-full mb-3"
                placeholder="Typ exact je naam"
                autoFocus
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting || confirmName.trim() !== user.name}
                  className={`px-4 py-2 rounded-md font-semibold ${
                    deleting || confirmName.trim() !== user.name
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {deleting ? 'Verwijderen...' : 'Bevestig verwijderen'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirming(false);
                    setConfirmName('');
                    setError(null);
                  }}
                  className="px-4 py-2 rounded-md font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


