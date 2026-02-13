import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient, api } from '../api/client';
import FacebookIcon from '../components/common/FacebookIcon';
import type { LeaderboardEntry } from '../api/client';

const ProfilePage: React.FC = () => {
  const { user, login, logout } = useAuth();
  const { t, language } = useLanguage();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', 'season'],
    queryFn: () => api.getLeaderboard(),
    enabled: !!user,
  });

  const userRanking = useMemo(() => {
    if (!user || leaderboard.length === 0) return null;
    const index = leaderboard.findIndex(e => e.userId === user.id);
    if (index === -1) return null;
    return { position: index + 1, total: leaderboard.length, score: leaderboard[index].totalScore };
  }, [user, leaderboard]);

  const getOrdinalSuffix = (n: number): string => {
    if (language === 'nl') return 'e';
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">{t('predict.loginRequired')}</h2>
          <p className="text-slate-400 mb-6">{t('profile.notLoggedIn')}</p>
          <button
            onClick={login}
            className="btn btn-primary flex items-center justify-center mx-auto"
          >
            <FacebookIcon className="w-4 h-4 mr-2" />
            {t('nav.loginWithFacebook')}
          </button>
        </div>
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

  const positionColorClass = (pos: number) => {
    if (pos === 1) return 'bg-podium-gold text-gray-900';
    if (pos === 2) return 'bg-podium-silver text-gray-900';
    if (pos === 3) return 'bg-podium-bronze text-gray-900';
    return 'bg-f1-surface-elevated text-white';
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="card p-6 mb-6">
          <div className="flex items-center">
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
        </div>

        {/* Season Ranking */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{t('profile.seasonRanking')}</h2>
            <Link to="/leaderboard" className="text-sm text-f1-red hover:text-red-400 transition-colors">
              {t('profile.viewLeaderboard')} →
            </Link>
          </div>

          {isLoadingLeaderboard ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-f1-surface-elevated animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-24 bg-f1-surface-elevated rounded animate-pulse" />
                <div className="h-4 w-16 bg-f1-surface-elevated rounded animate-pulse" />
              </div>
            </div>
          ) : userRanking ? (
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${positionColorClass(userRanking.position)}`}>
                {userRanking.position}
              </div>
              <div>
                <p className="text-white font-medium">
                  {userRanking.position}{getOrdinalSuffix(userRanking.position)} {t('leaderboard.of')} {userRanking.total}
                </p>
                <p className="text-slate-400 text-sm">
                  {userRanking.score} {t('common.points')}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-400 font-medium">{t('profile.noRankingYet')}</p>
              <p className="text-slate-500 text-sm mt-1">{t('profile.noRankingDescription')}</p>
            </div>
          )}
        </div>

        {/* Account */}
        <div className="card p-6">
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
