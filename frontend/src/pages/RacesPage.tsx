import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Race } from '../api/client';
import RaceCard from '../components/race/RaceCard';
import RaceCardCompact from '../components/race/RaceCardCompact';
import { useLanguage } from '../contexts/LanguageContext';

const RacesPage: React.FC = () => {
  const { t } = useLanguage();
  const [showUpcoming, setShowUpcoming] = useState(true);

  const { data: allRaces, isLoading: isLoadingAll } = useQuery<Race[]>({
    queryKey: ['races', 'all'],
    queryFn: () => api.getCurrentSeasonRaces(),
  });

  const { data: nextRace, isLoading: isLoadingNext } = useQuery<Race>({
    queryKey: ['races', 'next'],
    queryFn: () => api.getNextRace(),
  });

  if (isLoadingAll || isLoadingNext) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">{t('races.title')}</h1>
        {/* Skeleton: featured card + grid */}
        <div className="animate-pulse space-y-6">
          <div className="card h-48">
            <div className="h-6 bg-f1-surface-elevated rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-f1-surface-elevated rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-f1-surface-elevated rounded w-1/3"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="card h-40">
                <div className="h-5 bg-f1-surface-elevated rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-f1-surface-elevated rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-f1-surface-elevated rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!allRaces) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-white mb-4">{t('races.noRacesFound')}</h1>
        <p className="text-slate-300">{t('races.errorLoading')}</p>
      </div>
    );
  }

  const today = new Date();
  const upcomingRaces = allRaces.filter(race => new Date(race.date) >= today);
  const pastRaces = allRaces.filter(race => new Date(race.date) < today);

  // For the upcoming tab, separate the next race from the rest
  const featuredRace = showUpcoming && nextRace ? nextRace : null;
  const gridRaces = showUpcoming
    ? upcomingRaces.filter(race => !featuredRace || race.id !== featuredRace.id)
    : pastRaces;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">{t('races.calendar')}</h1>

      <div className="mb-8 flex gap-4">
        <button
          className={`btn ${showUpcoming ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowUpcoming(true)}
        >
          {t('races.upcomingRaces')}
        </button>
        <button
          className={`btn ${!showUpcoming ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowUpcoming(false)}
        >
          {t('races.pastRaces')}
        </button>
      </div>

      {/* Featured next race (upcoming tab only) */}
      {featuredRace && (
        <div className="mb-6">
          <RaceCard race={featuredRace} isNext />
        </div>
      )}

      {/* Grid of remaining races */}
      {gridRaces.length === 0 && !featuredRace ? (
        <div className="card p-6 text-center">
          <p className="text-xl text-slate-300">
            {showUpcoming ? t('races.noUpcomingScheduled') : t('races.noPastRaces')}
          </p>
        </div>
      ) : gridRaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gridRaces.map(race => (
            <RaceCardCompact key={race.id} race={race} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RacesPage;
