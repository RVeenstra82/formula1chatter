import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Race, PredictionResult } from '../api/client';

import ResultsPodium from '../components/prediction/ResultsPodium';
import { useLanguage } from '../contexts/LanguageContext';

const ResultsPage: React.FC = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const { data: race, isLoading: isLoadingRace } = useQuery<Race>({
    queryKey: ['race', raceId],
    queryFn: () => api.getRaceById(raceId!),
    enabled: !!raceId,
  });

  const { data: results = [], isLoading: isLoadingResults } = useQuery<PredictionResult[]>({
    queryKey: ['results', raceId],
    queryFn: () => api.getRaceResults(raceId!),
    enabled: !!raceId && !!race?.completed,
  });

  if (!raceId) {
    return <div>{t('common.raceIdRequired')}</div>;
  }
  
  const isLoading = isLoadingRace || isLoadingResults;
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-f1-surface-elevated rounded w-1/2 mb-4"></div>
        <div className="h-6 bg-f1-surface-elevated rounded w-1/3 mb-8"></div>
        <div className="card h-96"></div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-white mb-4">{t('common.notFound')}</h1>
        <p className="text-slate-300 mb-8">{t('races.notFound')}</p>
        <Link to="/races" className="btn btn-primary">
          {t('races.viewAllRaces')}
        </Link>
      </div>
    );
  }

  if (!race.completed) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-white mb-4">{t('results.notAvailable')}</h1>
        <p className="text-slate-300 mb-8">{t('results.notCompleted')}</p>
        <div className="flex gap-4 justify-center">
          <Link to={`/races/${race.id}`} className="btn btn-primary">
            {t('races.details')}
          </Link>
          <Link to={`/races/${race.id}/predict`} className="btn btn-secondary">
            {t('races.makePredict')}
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
        >
          {t('common.back')}
        </button>

        <Link
          to={`/races/${race.id}`}
          className="btn btn-secondary"
        >
          {t('races.details')}
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-white mb-4">{t('results.title')}</h1>
      <h2 className="text-xl text-slate-300 mb-8">{race.raceName} - {t('races.round')} {race.round}</h2>

      {results.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-xl text-slate-300 mb-4">{t('results.noPredictionsMade')}</p>
          <Link to="/races" className="btn btn-primary">
            {t('races.viewAllRaces')}
          </Link>
        </div>
      ) : (
        <>
          <ResultsPodium results={results} />

          <div className="card">
            <h3 className="text-xl font-bold text-white mb-4">{t('results.allResults')}</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-f1-bg">
                  <tr>
                    <th className="px-4 py-2 text-left text-slate-300">{t('results.rank')}</th>
                    <th className="px-4 py-2 text-left text-slate-300">{t('results.user')}</th>
                    <th className="px-4 py-2 text-right text-slate-300">{t('results.score')}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={result.userId}
                      className={index % 2 === 0 ? 'bg-f1-surface' : 'bg-f1-bg'}
                    >
                      <td className="px-4 py-3 border-t border-f1-border">
                        <div className="flex items-center">
                          <span className="font-bold text-white mr-2">{index + 1}</span>
                          {index < 3 && (
                            <span className={`
                              inline-block w-6 h-6 rounded-full text-white text-xs flex items-center justify-center
                              ${index === 0 ? 'bg-f1-red' : index === 1 ? 'bg-podium-silver' : 'bg-podium-bronze'}
                            `}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-t border-f1-border">
                        <div className="flex items-center">
                          {result.profilePictureUrl && (
                            <img
                              src={result.profilePictureUrl}
                              alt={result.userName}
                              className="w-8 h-8 rounded-full mr-3 profile-pic"
                            />
                          )}
                          <span className="text-slate-300">{result.userName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-t border-f1-border text-right font-bold text-white">{result.score} {t('results.pts')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsPage; 