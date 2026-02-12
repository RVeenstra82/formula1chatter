import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../api/client';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">{t('profile.notLoggedIn')}</div>
      </div>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await apiClient.delete('/users/me');
      await logout();
    } catch (e: unknown) {
      const axiosError = e as { response?: { data?: { error?: string } } };
      setError(axiosError?.response?.data?.error || t('profile.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6">
          <div className="flex items-center mb-6">
            {user.profilePictureUrl && (
              <img src={user.profilePictureUrl} alt={user.name} className="w-16 h-16 rounded-full mr-4" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              {user.email && !user.email.endsWith('@f1chatter.local') && (
                <p className="text-slate-400">{user.email}</p>
              )}
            </div>
          </div>

          <h2 className="text-lg font-semibold text-white mb-2">{t('profile.account')}</h2>
          <p className="text-sm text-slate-400 mb-4">{t('profile.deleteDescription')}</p>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-950/50 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}

          {!isConfirming ? (
            <button
              onClick={() => setIsConfirming(true)}
              className="px-4 py-2 rounded-md font-semibold bg-red-600 text-white hover:bg-red-700"
            >
              {t('profile.deleteAccount')}
            </button>
          ) : (
            <div className="mt-4 p-4 border border-red-500/30 rounded-md bg-red-950/50">
              <p className="text-sm text-red-400 mb-2 font-medium">
                {t('profile.deleteConfirmation')}
              </p>

              <div className="mb-3">
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">{t('profile.nameToType')}</p>
                <div className="px-3 py-2 rounded-md bg-f1-surface border border-f1-border text-white inline-block select-none">
                  {user.name}
                </div>
              </div>

              <label className="block text-sm text-slate-300 mb-1" htmlFor="confirmName">{t('profile.enterYourName')}</label>
              <input
                id="confirmName"
                type="text"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                className="input w-full mb-3"
                placeholder={t('profile.typeExactName')}
                autoComplete="off"
                spellCheck={false}
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'v')) {
                    e.preventDefault();
                  }
                }}
                autoFocus
              />

              <p className="text-xs text-slate-500 mb-3">{t('profile.copyPasteDisabled')}</p>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting || confirmName.trim() !== user.name}
                  className={`px-4 py-2 rounded-md font-semibold ${
                    deleting || confirmName.trim() !== user.name
                      ? 'bg-f1-surface-elevated text-slate-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {deleting ? t('profile.deleting') : t('profile.confirmDelete')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirming(false);
                    setConfirmName('');
                    setError(null);
                  }}
                  className="px-4 py-2 rounded-md font-semibold bg-f1-surface border border-f1-border text-slate-300 hover:bg-f1-surface-elevated"
                >
                  {t('common.cancel')}
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
