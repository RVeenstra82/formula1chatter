import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { LeaderboardEntry } from '../api/client';
import { mockLeaderboard } from '../mocks/mockLeaderboardData';

const LeaderboardPage: React.FC = () => {
  const { t } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Use mock data for testing
        setLeaderboard(mockLeaderboard);
        setLoading(false);
      } catch (err) {
        setError(t('leaderboard.error'));
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const podium = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('leaderboard.title')}</h1>
      
      {/* Podium */}
      <div className="mb-12">
        <div className="flex justify-center items-end space-x-4 h-64">
          {/* Second Place */}
          <div className="flex flex-col items-center w-48">
            <div className="bg-gray-200 rounded-t-lg p-4 w-full text-center">
              <div className="text-2xl font-bold text-gray-600">2</div>
              <div className="font-semibold">{podium[1]?.userName || '-'}</div>
              <div className="text-gray-600">{podium[1]?.totalScore || 0} {t('common.points')}</div>
            </div>
            <div className="bg-gray-300 h-32 w-full"></div>
          </div>

          {/* First Place */}
          <div className="flex flex-col items-center w-48">
            <div className="bg-yellow-100 rounded-t-lg p-4 w-full text-center border-2 border-yellow-400">
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <div className="font-semibold">{podium[0]?.userName || '-'}</div>
              <div className="text-yellow-600">{podium[0]?.totalScore || 0} {t('common.points')}</div>
            </div>
            <div className="bg-yellow-200 h-40 w-full border-2 border-yellow-400 border-t-0"></div>
          </div>

          {/* Third Place */}
          <div className="flex flex-col items-center w-48">
            <div className="bg-orange-100 rounded-t-lg p-4 w-full text-center border-2 border-orange-400">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="font-semibold">{podium[2]?.userName || '-'}</div>
              <div className="text-orange-600">{podium[2]?.totalScore || 0} {t('common.points')}</div>
            </div>
            <div className="bg-orange-200 h-24 w-full border-2 border-orange-400 border-t-0"></div>
          </div>
        </div>
      </div>

      {/* Rest of the leaderboard */}
      {restOfLeaderboard.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('leaderboard.position')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('leaderboard.user')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('leaderboard.points')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {restOfLeaderboard.map((entry, index) => (
                <tr key={entry.userId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 4}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.totalScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage; 