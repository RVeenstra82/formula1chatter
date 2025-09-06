import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Race, Driver } from '../api/client';
import { useLanguage } from '../contexts/LanguageContext';
import { formatDateLocalized, formatTimeLocalized, calculateTimeRemaining, isLessThanOneHour, hasRaceStarted } from '../utils/timeUtils';
import { mockRaces } from '../mocks/mockLeaderboardData';

const RaceDetailPage: React.FC = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  if (!raceId) {
    return <div>{t('common.raceIdRequired')}</div>;
  }
  
  const { data: race, isLoading: isLoadingRace } = useQuery<Race>({
    queryKey: ['race', raceId],
    queryFn: () => {
      if (import.meta.env.DEV) {
        // Use mock data in development
        const mockRace = mockRaces.find(r => r.id === raceId);
        if (mockRace) {
          return Promise.resolve(mockRace);
        }
      }
      return api.getRaceById(raceId);
    },
  });
  
  const { data: drivers, isLoading: isLoadingDrivers } = useQuery<Driver[]>({
    queryKey: ['active-drivers', raceId],
    queryFn: () => (raceId ? api.getActiveDriversForRace(raceId) : Promise.resolve([] as Driver[])),
    enabled: !!raceId,
  });
  
  useEffect(() => {
    if (!race || race.completed) return;
    
    const started = hasRaceStarted(race.date, race.time);
    if (started) return;
    
    const updateTimeRemaining = () => {
      setTimeRemaining(calculateTimeRemaining(race.date, race.time, language));
    };
    
    // Update immediately
    updateTimeRemaining();
    
    // Set up interval to update every minute
    const interval = setInterval(updateTimeRemaining, 60000);
    
    // Clean up interval
    return () => clearInterval(interval);
  }, [race, language]);
  
  if (isLoadingRace || isLoadingDrivers) {
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
  
  // Format date based on locale
  const formattedDate = formatDateLocalized(race.date, 'PPP', language);
  
  // Format time based on locale
  const formattedTime = race.time 
    ? formatTimeLocalized(race.time, language === 'nl' ? 'HH:mm' : 'h:mm a', language)
    : 'TBA';
  
  const getDriverById = (driverId: string | null) => {
    if (!driverId || !drivers) return null;
    return drivers.find(driver => driver.id === driverId);
  };
  
  const firstPlaceDriver = getDriverById(race.firstPlaceDriverId);
  const secondPlaceDriver = getDriverById(race.secondPlaceDriverId);
  const thirdPlaceDriver = getDriverById(race.thirdPlaceDriverId);
  const fastestLapDriver = getDriverById(race.fastestLapDriverId);
  const driverOfTheDayDriver = getDriverById(race.driverOfTheDayId);
  
  const started = hasRaceStarted(race.date, race.time);
  const canPredict = !race.completed && !started;
  
  return (
    <div>
      <div className="mb-8 flex justify-between items-center z-10 relative">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
        >
          {t('common.back')}
        </button>
        
        {canPredict && (
          <Link 
            to={`/races/${race.id}/predict`}
            className="btn btn-primary relative z-20"
          >
            {t('races.makePredict')}
          </Link>
        )}
        
        {race.completed && (
          <Link 
            to={`/races/${race.id}/results`}
            className="btn btn-primary"
          >
            {t('races.viewResults')}
          </Link>
        )}
      </div>
      
      <div className="card mb-8">
        <h1 className="text-3xl font-bold mb-2">{race.raceName}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-semibold">
            {t('races.round')} {race.round}
          </span>
          <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-semibold">
            {t('races.season')} {race.season}
          </span>
          {race.completed ? (
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              {t('races.completed')}
            </span>
          ) : started ? (
            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
              {t('races.inProgress')}
            </span>
          ) : (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {t('races.upcoming')}
            </span>
          )}
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">{t('race.circuitInfo')}</h2>
          <p className="text-gray-700">{race.circuitName}</p>
          <p className="text-gray-600">{race.locality}, {race.country}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">{t('race.raceSchedule')}</h2>
          <p className="text-gray-700">
            <span className="font-semibold">{t('races.date')}:</span> {formattedDate}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">{t('races.time')}:</span> {formattedTime} <span className="text-xs text-gray-500">({t('races.localTime')})</span>
          </p>
          
          {canPredict && timeRemaining && (
            <div className={`mt-4 p-4 rounded ${
              isLessThanOneHour(race.date, race.time)
                ? 'bg-red-50'
                : 'bg-blue-50'
            }`}>
              <p className={`font-semibold ${
                isLessThanOneHour(race.date, race.time)
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}>{t('races.timeRemaining')}: {timeRemaining}</p>
              <p className={`text-sm mt-1 ${
                isLessThanOneHour(race.date, race.time)
                  ? 'text-red-600'
                  : 'text-blue-600'
              }`}>{t('races.saveBeforeStart')}</p>
              <Link 
                to={`/races/${race.id}/predict`}
                className="btn btn-primary btn-sm mt-3"
              >
                {t('races.makePredict')}
              </Link>
            </div>
          )}
        </div>
        
        {/* Practice and Qualifying Schedule */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">{t('race.weekendSchedule')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Practice Sessions */}
            <div className="card">
              <h3 className="text-lg font-bold mb-3">{t('race.practiceSessions')}</h3>
              
              {race.practice1Date && race.practice1Time && (
                <div className="mb-3 p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800">{t('race.practice1')}</span>
                    <span className="text-sm text-gray-600">
                      {formatDateLocalized(race.practice1Date, 'PP', language)}
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    {formatTimeLocalized(race.practice1Time, language === 'nl' ? 'HH:mm' : 'h:mm a', language)}
                  </p>
                </div>
              )}
              
              {race.practice2Date && race.practice2Time && (
                <div className="mb-3 p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800">{t('race.practice2')}</span>
                    <span className="text-sm text-gray-600">
                      {formatDateLocalized(race.practice2Date, 'PP', language)}
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    {formatTimeLocalized(race.practice2Time, language === 'nl' ? 'HH:mm' : 'h:mm a', language)}
                  </p>
                </div>
              )}
              
              {race.practice3Date && race.practice3Time && (
                <div className="mb-3 p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800">{t('race.practice3')}</span>
                    <span className="text-sm text-gray-600">
                      {formatDateLocalized(race.practice3Date, 'PP', language)}
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    {formatTimeLocalized(race.practice3Time, language === 'nl' ? 'HH:mm' : 'h:mm a', language)}
                </p>
                </div>
              )}
              
              {!race.practice1Date && !race.practice2Date && !race.practice3Date && (
                <p className="text-gray-600 italic">{t('race.scheduleTBA')}</p>
              )}
            </div>
            
            {/* Qualifying */}
            <div className="card">
              <h3 className="text-lg font-bold mb-3">{t('race.qualifying')}</h3>
              
              {race.qualifyingDate && race.qualifyingTime ? (
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-800">{t('race.qualifying')}</span>
                    <span className="text-sm text-gray-600">
                      {formatDateLocalized(race.qualifyingDate, 'PP', language)}
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    {formatTimeLocalized(race.qualifyingTime, language === 'nl' ? 'HH:mm' : 'h:mm a', language)}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 italic">{t('race.scheduleTBA')}</p>
              )}
            </div>
            
            {/* Sprint Weekend Information */}
            {race.isSprintWeekend && (
              <div className="card border-2 border-purple-200">
                <div className="flex items-center mb-3">
                  <h3 className="text-lg font-bold text-purple-800">🏁 Sprint Weekend</h3>
                </div>
                
                {/* Sprint Qualifying */}
                {race.sprintQualifyingDate && race.sprintQualifyingTime && (
                  <div className="mb-3 p-3 bg-purple-50 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-purple-800">Sprint Qualifying</span>
                      <span className="text-sm text-purple-600">
                        {formatDateLocalized(race.sprintQualifyingDate, 'PP', language)}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-purple-900">
                      {formatTimeLocalized(race.sprintQualifyingTime, language === 'nl' ? 'HH:mm' : 'h:mm a', language)}
                    </p>
                  </div>
                )}
                
                {/* Sprint Race */}
                {race.sprintDate && race.sprintTime && (
                  <div className="p-3 bg-purple-50 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-purple-800">Sprint Race</span>
                      <span className="text-sm text-purple-600">
                        {formatDateLocalized(race.sprintDate, 'PP', language)}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-purple-900">
                      {formatTimeLocalized(race.sprintTime, language === 'nl' ? 'HH:mm' : 'h:mm a', language)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {race.completed && (
          <div>
            <h2 className="text-xl font-bold mb-4">{t('race.results')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {firstPlaceDriver && (
                <div className="card bg-yellow-50 border-yellow-200">
                  <div className="text-center font-bold text-yellow-800 mb-2">{t('race.firstPlace')}</div>
                  <div className="text-lg font-semibold">{firstPlaceDriver.firstName} {firstPlaceDriver.lastName}</div>
                  <div className="text-gray-600">{firstPlaceDriver.constructorName}</div>
                </div>
              )}
              
              {secondPlaceDriver && (
                <div className="card bg-gray-50 border-gray-200">
                  <div className="text-center font-bold text-gray-600 mb-2">{t('race.secondPlace')}</div>
                  <div className="text-lg font-semibold">{secondPlaceDriver.firstName} {secondPlaceDriver.lastName}</div>
                  <div className="text-gray-600">{secondPlaceDriver.constructorName}</div>
                </div>
              )}
              
              {thirdPlaceDriver && (
                <div className="card bg-amber-50 border-amber-200">
                  <div className="text-center font-bold text-amber-800 mb-2">{t('race.thirdPlace')}</div>
                  <div className="text-lg font-semibold">{thirdPlaceDriver.firstName} {thirdPlaceDriver.lastName}</div>
                  <div className="text-gray-600">{thirdPlaceDriver.constructorName}</div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {fastestLapDriver && (
                <div className="card bg-blue-50 border-blue-200">
                  <div className="text-center font-bold text-blue-800 mb-2">{t('race.fastestLap')}</div>
                  <div className="text-lg font-semibold">{fastestLapDriver.firstName} {fastestLapDriver.lastName}</div>
                  <div className="text-gray-600">{fastestLapDriver.constructorName}</div>
                </div>
              )}
              
              {driverOfTheDayDriver && (
                <div className="card bg-purple-50 border-purple-200">
                  <div className="text-center font-bold text-purple-800 mb-2">{t('race.driverOfDay')}</div>
                  <div className="text-lg font-semibold">{driverOfTheDayDriver.firstName} {driverOfTheDayDriver.lastName}</div>
                  <div className="text-gray-600">{driverOfTheDayDriver.constructorName}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaceDetailPage; 