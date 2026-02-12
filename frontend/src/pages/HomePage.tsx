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
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
          <span className="text-f1-red">Formula 1</span> {t('home.title')}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-6 px-4">
          {t('home.subtitle')}
        </p>
        
        {!user && (
          <div className="mt-4">
            <button 
              onClick={login} 
              className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3"
            >
              {t('home.loginToStart')}
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t('races.nextRace')}</h2>
          {isLoadingRace ? (
            <div className="card animate-pulse h-48">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            </div>
          ) : nextRace ? (
            <RaceCard race={nextRace} isNext={true} />
          ) : (
            <div className="card">
              <p>{t('home.noUpcomingRaces')}</p>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t('home.howItWorks')}</h2>
          <div className="card space-y-4">
            <div className="flex items-start">
              <div className="bg-f1-red text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 text-sm sm:text-base font-bold">
                1
              </div>
              <p className="text-sm sm:text-base">{t('home.step1')}</p>
            </div>
            
            <div className="flex items-start">
              <div className="bg-f1-red text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 text-sm sm:text-base font-bold">
                2
              </div>
              <p className="text-sm sm:text-base">{t('home.step2')}</p>
            </div>
            
            <div className="flex items-start">
              <div className="bg-f1-red text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 text-sm sm:text-base font-bold">
                3
              </div>
              <p className="text-sm sm:text-base">{t('home.step3')}</p>
            </div>
            
            <div className="flex items-start">
              <div className="bg-f1-red text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 text-sm sm:text-base font-bold">
                4
              </div>
              <p className="text-sm sm:text-base">{t('home.step4')}</p>
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