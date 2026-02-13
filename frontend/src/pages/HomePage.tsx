import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Race } from '../api/client';
import RaceCard from '../components/race/RaceCard';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const HomePage: React.FC = () => {
  const { user, login } = useAuth();
  const { t } = useLanguage();

  const { data: nextRace, isLoading: isLoadingRace } = useQuery<Race>({
    queryKey: ['nextRace'],
    queryFn: () => api.getNextRace(),
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="relative text-center mb-8 sm:mb-12 py-12 px-4 overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-f1-red/5 to-transparent"></div>

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 uppercase tracking-f1">
            <span className="text-f1-red drop-shadow-[0_0_15px_rgba(225,6,0,0.5)]">Formula 1</span>
            <br />
            <span className="text-white">{t('home.title')}</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 mb-6 px-4 font-body">
            {t('home.subtitle')}
          </p>

          <div className="mt-4">
            {!user ? (
              <button
                onClick={login}
                className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 red-glow-hover"
              >
                {t('home.loginToStart')}
              </button>
            ) : (
              <Link
                to="/races"
                className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 red-glow-hover inline-block"
              >
                {t('home.viewRaces')}
              </Link>
            )}
          </div>
        </div>

        {/* Diagonal accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-f1-red to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase tracking-f1 racing-stripe">{t('races.nextRace')}</h2>
          {isLoadingRace ? (
            <div className="card animate-pulse min-h-[220px]">
              <div className="h-6 bg-f1-surface-elevated rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-f1-surface-elevated rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-f1-surface-elevated rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-f1-surface-elevated rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-f1-surface-elevated rounded w-1/2"></div>
            </div>
          ) : nextRace ? (
            <RaceCard race={nextRace} isNext={true} carbon={false} />
          ) : (
            <div className="card">
              <p className="text-slate-400">{t('home.noUpcomingRaces')}</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase tracking-f1 racing-stripe">{t('home.howItWorks')}</h2>
          <div className="card space-y-4">
            <div className="flex items-start">
              <div className="bg-f1-red text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 text-sm sm:text-base font-bold shadow-lg shadow-f1-red/30">
                1
              </div>
              <p className="text-sm sm:text-base text-slate-300 font-body">{t('home.step1')}</p>
            </div>

            <div className="flex items-start">
              <div className="bg-f1-red text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 text-sm sm:text-base font-bold shadow-lg shadow-f1-red/30">
                2
              </div>
              <p className="text-sm sm:text-base text-slate-300 font-body">{t('home.step2')}</p>
            </div>

            <div className="flex items-start">
              <div className="bg-f1-red text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 text-sm sm:text-base font-bold shadow-lg shadow-f1-red/30">
                3
              </div>
              <p className="text-sm sm:text-base text-slate-300 font-body">{t('home.step3')}</p>
            </div>

            <div className="flex items-start">
              <div className="bg-f1-red text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 text-sm sm:text-base font-bold shadow-lg shadow-f1-red/30">
                4
              </div>
              <p className="text-sm sm:text-base text-slate-300 font-body">{t('home.step4')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <Link to="/races" className="btn btn-primary px-6 sm:px-8 py-3">
          {t('races.viewAllRaces')}
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
