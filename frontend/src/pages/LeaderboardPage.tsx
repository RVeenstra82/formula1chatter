import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import type { LeaderboardEntry, Race, PredictionResult } from '../api/client';
import { api } from '../api/client';
import FacebookIcon from '../components/common/FacebookIcon';
import PositionChangeIndicator from '../components/prediction/PositionChangeIndicator';
import { getSeasonState } from '../utils/timeUtils';

type ViewMode = 'season' | 'race';

const LeaderboardPage: React.FC = () => {
  const { t } = useLanguage();
  const { user, login, isLoading: isLoadingAuth } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('season');
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);

  // Fetch all races to get completed ones for the race menu
  const { data: allRaces = [] } = useQuery<Race[]>({
    queryKey: ['races', 'all'],
    queryFn: () => api.getCurrentSeasonRaces(),
  });

  // Get completed races for the sidebar menu
  const completedRaces = allRaces.filter(race => race.completed).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Set first completed race as default when switching to race mode
  useEffect(() => {
    if (viewMode === 'race' && completedRaces.length > 0 && !selectedRaceId) {
      setSelectedRaceId(completedRaces[0].id);
    }
  }, [viewMode, completedRaces, selectedRaceId]);

  // Fetch season leaderboard
  const { data: seasonLeaderboard = [], isLoading: isLoadingSeason } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', 'season'],
    queryFn: () => api.getLeaderboard(),
    enabled: viewMode === 'season',
  });

  // Fetch race leaderboard
  const { data: raceLeaderboard = [], isLoading: isLoadingRace } = useQuery<PredictionResult[]>({
    queryKey: ['leaderboard', 'race', selectedRaceId],
    queryFn: () => api.getRaceLeaderboard(selectedRaceId!),
    enabled: viewMode === 'race' && !!selectedRaceId,
  });

  const isLoading = (viewMode === 'season' && isLoadingSeason) || (viewMode === 'race' && isLoadingRace);

  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-f1-red"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{t('leaderboard.loginRequired')}</h1>
          <p className="text-slate-400 mb-6">{t('leaderboard.loginToView')}</p>
          <button
            onClick={login}
            className="btn btn-primary inline-flex items-center"
          >
            <FacebookIcon className="w-4 h-4 mr-2" />
            {t('predict.loginFacebook')}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-f1-red"></div>
      </div>
    );
  }

  const seasonState = getSeasonState(allRaces);

  const renderEmptyState = () => {
    if (seasonState === 'pre-season') {
      return (
        <div className="card p-8 text-center max-w-lg mx-auto">
          <div className="text-6xl mb-4">🏁</div>
          <h3 className="text-lg font-semibold mb-2 text-white">{t('common.seasonNotStarted')}</h3>
          <p className="text-slate-400">{t('common.seasonNotStartedDescription')}</p>
        </div>
      );
    }
    return (
      <div className="card p-8 text-center max-w-lg mx-auto">
        <div className="text-6xl mb-4">⏳</div>
        <h3 className="text-lg font-semibold mb-2 text-white">{t('common.waitingForResults')}</h3>
        <p className="text-slate-400">{t('common.waitingForResultsDescription')}</p>
      </div>
    );
  };

  const renderPodium = (data: (LeaderboardEntry | PredictionResult)[]) => {
    const podium = data.slice(0, 3);

    return (
      <div className="mb-12">
        <div className="flex justify-center items-end space-x-4 h-64">
          {/* Second Place */}
          <div className="flex flex-col items-center w-48">
            <div className="bg-podium-silver/20 rounded-t-lg p-4 w-full text-center">
              <div className="text-2xl font-bold text-slate-400">2</div>
              <div className="font-semibold text-white">{podium[1]?.userName || '-'}</div>
              <div className="text-slate-400">
                {viewMode === 'season'
                  ? `${(podium[1] as LeaderboardEntry)?.totalScore || 0} ${t('common.points')}`
                  : `${(podium[1] as PredictionResult)?.score || 0} ${t('common.points')}`
                }
              </div>
              {viewMode === 'race' && podium[1] && (
                <div className="mt-2">
                  <PositionChangeIndicator
                    currentPosition={(podium[1] as PredictionResult).seasonPosition}
                    previousPosition={(podium[1] as PredictionResult).previousSeasonPosition}
                  />
                </div>
              )}
            </div>
            <div className="bg-podium-silver/30 h-32 w-full"></div>
          </div>

          {/* First Place */}
          <div className="flex flex-col items-center w-48">
            <div className="bg-podium-gold/20 rounded-t-lg p-4 w-full text-center border-2 border-podium-gold/50">
              <div className="text-2xl font-bold text-podium-gold">1</div>
              <div className="font-semibold text-white">{podium[0]?.userName || '-'}</div>
              <div className="text-podium-gold">
                {viewMode === 'season'
                  ? `${(podium[0] as LeaderboardEntry)?.totalScore || 0} ${t('common.points')}`
                  : `${(podium[0] as PredictionResult)?.score || 0} ${t('common.points')}`
                }
              </div>
              {viewMode === 'race' && podium[0] && (
                <div className="mt-2">
                  <PositionChangeIndicator
                    currentPosition={(podium[0] as PredictionResult).seasonPosition}
                    previousPosition={(podium[0] as PredictionResult).previousSeasonPosition}
                  />
                </div>
              )}
            </div>
            <div className="bg-podium-gold/30 h-40 w-full border-2 border-podium-gold/50 border-t-0"></div>
          </div>

          {/* Third Place */}
          <div className="flex flex-col items-center w-48">
            <div className="bg-podium-bronze/20 rounded-t-lg p-4 w-full text-center border-2 border-podium-bronze/50">
              <div className="text-2xl font-bold text-podium-bronze">3</div>
              <div className="font-semibold text-white">{podium[2]?.userName || '-'}</div>
              <div className="text-podium-bronze">
                {viewMode === 'season'
                  ? `${(podium[2] as LeaderboardEntry)?.totalScore || 0} ${t('common.points')}`
                  : `${(podium[2] as PredictionResult)?.score || 0} ${t('common.points')}`
                }
              </div>
              {viewMode === 'race' && podium[2] && (
                <div className="mt-2">
                  <PositionChangeIndicator
                    currentPosition={(podium[2] as PredictionResult).seasonPosition}
                    previousPosition={(podium[2] as PredictionResult).previousSeasonPosition}
                  />
                </div>
              )}
            </div>
            <div className="bg-podium-bronze/30 h-24 w-full border-2 border-podium-bronze/50 border-t-0"></div>
          </div>
        </div>
      </div>
    );
  };

  const renderLeaderboardTable = (data: (LeaderboardEntry | PredictionResult)[]) => {
    const restOfLeaderboard = data.slice(3);

    if (restOfLeaderboard.length === 0) {
      return (
        <div className="card p-8 text-center">
          <p className="text-slate-400 text-lg">
            {viewMode === 'season'
              ? t('leaderboard.noResults')
              : t('leaderboard.noRaceResults')
            }
          </p>
        </div>
      );
    }

    return (
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-f1-border">
          <thead className="bg-f1-bg">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('leaderboard.position')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('leaderboard.user')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('leaderboard.points')}
              </th>
              {viewMode === 'race' && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {t('leaderboard.change')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-f1-surface divide-y divide-f1-border">
            {restOfLeaderboard.map((entry, index) => (
              <tr key={entry.userId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {index + 4}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {entry.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {viewMode === 'season'
                    ? (entry as LeaderboardEntry).totalScore
                    : (entry as PredictionResult).score
                  }
                </td>
                {viewMode === 'race' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <PositionChangeIndicator
                      currentPosition={(entry as PredictionResult).seasonPosition}
                      previousPosition={(entry as PredictionResult).previousSeasonPosition}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">{t('leaderboard.title')}</h1>

      {/* View Mode Toggle */}
      {completedRaces.length > 0 && <div className="mb-8">
        <div className="flex gap-4">
          <button
            className={`btn ${viewMode === 'season' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('season')}
          >
            {t('leaderboard.seasonTotal')}
          </button>
          <button
            className={`btn ${viewMode === 'race' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('race')}
          >
            {t('leaderboard.raceResults')}
          </button>
        </div>
      </div>}

      {/* Content */}
      {completedRaces.length === 0 ? (
        renderEmptyState()
      ) : viewMode === 'season' ? (
        <>
          {renderPodium(seasonLeaderboard)}
          {renderLeaderboardTable(seasonLeaderboard)}
        </>
      ) : (
        <div className="flex gap-8">
          {/* Race Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t('leaderboard.selectRace')}</h3>
              {completedRaces.length === 0 ? (
                <div className="text-center py-4 text-slate-500">
                  {t('leaderboard.noCompletedRaces')}
                </div>
              ) : (
                <div className="space-y-2">
                  {completedRaces.map((race) => (
                    <button
                      key={race.id}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        selectedRaceId === race.id
                          ? 'bg-f1-red text-white'
                          : 'bg-f1-bg text-slate-300 hover:bg-f1-surface-elevated'
                      }`}
                      onClick={() => setSelectedRaceId(race.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-sm">{race.raceName}</div>
                        <div className="text-xs opacity-75">
                          {new Date(race.date).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Race Results */}
          <div className="flex-1">
            {selectedRaceId && completedRaces.length > 0 ? (
              <>
                {renderPodium(raceLeaderboard)}
                {renderLeaderboardTable(raceLeaderboard)}
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                {t('leaderboard.noCompletedRaces')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage; 