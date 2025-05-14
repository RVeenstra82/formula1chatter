import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { LeaderboardEntry } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [season, setSeason] = useState<number>(currentYear);
  
  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', season],
    queryFn: () => api.getSeasonLeaderboard(season),
  });
  
  // Find the current user's position in the leaderboard
  const currentUserPosition = user
    ? leaderboard.findIndex(entry => entry.userId === user.id) + 1
    : -1;
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('leaderboard.title')}</h1>
      
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label htmlFor="season" className="font-medium">{t('leaderboard.season')}:</label>
          <select
            id="season"
            className="select"
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
          >
            {[currentYear - 2, currentYear - 1, currentYear].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        
        {user && currentUserPosition > 0 && (
          <div className="bg-blue-100 px-4 py-2 rounded-lg text-blue-800">
            <span className="font-semibold">{t('leaderboard.yourPosition')}:</span> {currentUserPosition} {t('leaderboard.of')} {leaderboard.length}
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-xl mb-4">{t('leaderboard.noResults')}</p>
          <p>{t('leaderboard.checkBack')}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('leaderboard.position')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('leaderboard.user')}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('leaderboard.points')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry, index) => (
                        <tr 
                          key={entry.userId} 
                          className={`
                            ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            ${entry.userId === user?.id ? 'bg-blue-50' : ''}
                          `}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="font-bold text-gray-900 mr-2">{index + 1}</span>
                              {index < 3 && (
                                <span 
                                  className={`
                                    inline-block w-6 h-6 rounded-full text-white text-xs flex items-center justify-center
                                    ${index === 0 ? 'bg-f1-red' : index === 1 ? 'bg-gray-500' : 'bg-amber-700'}
                                  `}
                                >
                                  {index + 1}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {entry.profilePictureUrl && (
                                <img 
                                  src={entry.profilePictureUrl}
                                  alt={entry.userName}
                                  className="w-10 h-10 rounded-full mr-3 profile-pic"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {entry.userName}
                                </div>
                                {entry.userId === user?.id && (
                                  <div className="text-xs text-blue-600">{t('leaderboard.you')}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-lg font-bold">
                            {entry.totalScore}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage; 