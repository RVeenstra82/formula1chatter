import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Race } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import PredictionForm from '../components/prediction/PredictionForm';
import { calculateTimeRemaining, isLessThanOneHour, isLessThanFiveMinutes, hasRaceStarted } from '../utils/timeUtils';

// Helper function to get race ID from country name
const getRaceIdFromCountry = (country?: string): string | null => {
  if (!country) return null;
  
  // Map country names to race IDs (this could be made more dynamic)
  const countryToRaceMap: Record<string, string> = {
    'netherlands': '2025-15', // Dutch GP
    'belgium': '2025-14',     // Belgian GP
    'hungary': '2025-13',     // Hungarian GP
    'britain': '2025-12',     // British GP
    'austria': '2025-11',     // Austrian GP
    'spain': '2025-10',       // Spanish GP
    'monaco': '2025-9',       // Monaco GP
    'italy': '2025-8',        // Italian GP
    'france': '2025-7',       // French GP
    'canada': '2025-6',       // Canadian GP
    'miami': '2025-5',        // Miami GP
    'china': '2025-4',        // Chinese GP
    'japan': '2025-3',        // Japanese GP
    'australia': '2025-2',    // Australian GP
    'bahrain': '2025-1',      // Bahrain GP
  };
  
  return countryToRaceMap[country.toLowerCase()] || null;
};

const PredictionPage: React.FC = () => {
  const { raceId, country } = useParams<{ raceId?: string; country?: string }>();
  const navigate = useNavigate();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { t, language } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  // Determine the actual race ID based on URL format
  const actualRaceId = raceId || getRaceIdFromCountry(country);
  
  if (!actualRaceId) {
    return <div>Race ID is required</div>;
  }
  
  const { data: race, isLoading: isLoadingRace } = useQuery<Race>({
    queryKey: ['race', actualRaceId],
    queryFn: () => api.getRaceById(actualRaceId),
  });
  
  // Update countdown timer every second
  useEffect(() => {
    if (!race) return;
    
    const updateTimer = () => {
      const remaining = calculateTimeRemaining(race.date, race.time, language);
      setTimeRemaining(remaining);
    };
    
    // Update immediately and then every second
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [race, language]);
  
  const isLoading = isLoadingRace || isLoadingAuth;
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-8"></div>
        <div className="card h-96"></div>
      </div>
    );
  }
  
  if (!race) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">{t('common.notFound')}</h1>
        <p className="mb-8">{t('races.notFound')}</p>
        <Link to="/races" className="btn btn-primary">
          {t('races.viewAllRaces')}
        </Link>
      </div>
    );
  }
  
  if (race.completed) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">{race.raceName} {t('predict.isComplete')}</h1>
        <p className="mb-8">{t('predict.raceComplete')}</p>
        <div className="flex gap-4 justify-center">
          <Link to={`/races/${race.id}/results`} className="btn btn-primary">
            {t('races.viewResults')}
          </Link>
          <Link to={`/races/${race.id}`} className="btn btn-secondary">
            {t('races.details')}
          </Link>
        </div>
      </div>
    );
  }
  
  const started = hasRaceStarted(race.date, race.time);
  if (started) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">{race.raceName} {t('predict.isInProgress')}</h1>
        <p className="mb-8">{t('predict.raceStarted')}</p>
        <div className="flex gap-4 justify-center">
          <Link to={`/races/${race.id}`} className="btn btn-primary">
            {t('races.details')}
          </Link>
          <Link to="/races" className="btn btn-secondary">
            {t('races.viewAllRaces')}
          </Link>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">{t('predict.loginRequired')}</h1>
        <p className="mb-8">{t('predict.needLogin')}</p>
        <button 
          onClick={useAuth().login} 
          className="btn btn-primary"
        >
          {t('predict.loginFacebook')}
        </button>
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
          {t('predict.back')}
        </button>
        
        <Link 
          to={`/races/${race.id}`}
          className="btn btn-secondary"
        >
          {t('races.details')}
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">{t('predict.title')}: {race.raceName}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <PredictionForm 
            race={race}
            onSuccess={() => {
              navigate(`/races/${race.id}`);
            }}
          />
        </div>
        
        <div>
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">{t('race.raceInfo')}</h2>
            <p className="text-lg mb-2">
              <span className="font-semibold">{race.raceName}</span> - {t('races.round')} {race.round}
            </p>
            <p className="mb-4">{race.circuitName}, {race.locality}, {race.country}</p>
            
            {timeRemaining && (
              <div className={`p-4 rounded-md mb-6 ${
                isLessThanOneHour(race.date, race.time) 
                  ? 'bg-red-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                <p className="font-bold text-lg mb-1">{t('races.timeRemaining')}:</p>
                <p className="text-2xl font-bold">{timeRemaining}</p>
                <p className="text-sm mt-2">{t('races.saveBeforeStart')}</p>
              </div>
            )}
            
            <h3 className="text-xl font-bold mb-2">{t('predict.howScoring')}</h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>
                <span className="font-semibold">5 {t('common.points')}</span> {t('predict.for1stPlace')}
              </li>
              <li>
                <span className="font-semibold">3 {t('common.points')}</span> {t('predict.for2ndPlace')}
              </li>
              <li>
                <span className="font-semibold">1 {t('common.point')}</span> {t('predict.for3rdPlace')}
              </li>
              <li>
                <span className="font-semibold">1 {t('common.point')}</span> {t('predict.forFastestLap')}
              </li>
              <li>
                <span className="font-semibold">1 {t('common.point')}</span> {t('predict.forDriverOfDay')}
              </li>
            </ul>
            
            <div className="bg-yellow-100 p-4 rounded-md text-yellow-800">
              <p className="font-semibold">{t('common.important')}:</p>
              <p>{t('predict.canUpdateBeforeStart')}</p>
              {isLessThanFiveMinutes(race.date, race.time) && (
                <p className="font-bold text-red-600 mt-2">
                  ⚠️ {t('predict.noMorePredictions')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionPage; 