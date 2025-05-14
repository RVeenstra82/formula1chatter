import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Race, Driver } from '../api/client';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { formatDateLocalized, formatTimeLocalized, calculateTimeRemaining } from '../utils/timeUtils';

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
    queryFn: () => api.getRaceById(raceId),
  });
  
  const { data: drivers, isLoading: isLoadingDrivers } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: api.getAllDrivers,
  });
  
  useEffect(() => {
    if (!race || race.completed) return;
    
    const isPast = new Date(race.date) < new Date();
    if (isPast) return;
    
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
  
  const isPast = new Date(race.date) < new Date();
  const canPredict = !race.completed && !isPast;
  
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
        >
          {t('common.back')}
        </button>
        
        {canPredict && (
          <Link 
            to={`/races/${race.id}/predict`}
            className="btn btn-primary"
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
          ) : new Date(race.date) < new Date() ? (
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
            <div className="mt-4 bg-blue-50 p-4 rounded">
              <p className="font-semibold text-blue-700">{t('races.timeRemaining')}: {timeRemaining}</p>
              <p className="text-sm text-blue-600 mt-1">{t('races.saveBeforeStart')}</p>
              <Link 
                to={`/races/${race.id}/predict`}
                className="btn btn-primary btn-sm mt-3"
              >
                {t('races.makePredict')}
              </Link>
            </div>
          )}
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