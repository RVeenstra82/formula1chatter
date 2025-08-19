import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDateLocalized, formatTimeLocalized, calculateTimeRemaining, isLessThanOneHour } from '../../utils/timeUtils';

interface RaceCardProps {
  race: any;
  isNext?: boolean;
}

const RaceCard: React.FC<RaceCardProps> = ({ race, isNext = false }) => {
  const { t, language } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  // Format date based on locale
  const formattedDate = formatDateLocalized(race.date, 'PP', language);
  
  // Format time based on locale
  const formattedTime = race.time 
    ? formatTimeLocalized(race.time, language === 'nl' ? 'HH:mm' : 'h:mm a', language)
    : 'TBA';
    
  const isPast = new Date(race.date) < new Date();
  const canPredict = !race.completed && !isPast;
  
  // Update time remaining every minute
  useEffect(() => {
    if (!canPredict) return;
    
    const updateTimeRemaining = () => {
      setTimeRemaining(calculateTimeRemaining(race.date, race.time, language));
    };
    
    // Update immediately
    updateTimeRemaining();
    
    // Set up interval to update every minute
    const interval = setInterval(updateTimeRemaining, 60000);
    
    // Clean up interval
    return () => clearInterval(interval);
  }, [race.date, race.time, language, canPredict]);
  
  return (
    <div className={`card transition-all duration-300 ${isNext ? 'border-2 border-f1-red' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold">{race.raceName}</h3>
          <p className="text-gray-700 text-sm sm:text-base">{race.circuitName}</p>
          <p className="text-gray-600 text-xs sm:text-sm">{race.locality}, {race.country}</p>
          
          <div className="mt-3">
            <p className="text-gray-800 text-sm sm:text-base">
              <span className="font-semibold">{t('races.date')}:</span> {formattedDate}
            </p>
            <p className="text-gray-800 text-sm sm:text-base">
              <span className="font-semibold">{t('races.time')}:</span> {formattedTime} <span className="text-xs text-gray-500">({t('races.localTime')})</span>
            </p>
            
            {canPredict && timeRemaining && (
              <div className={`mt-2 p-2 rounded text-xs sm:text-sm ${
                isLessThanOneHour(race.date, race.time)
                  ? 'bg-red-50 text-red-800'
                  : 'bg-blue-50 text-gray-800'
              }`}>
                <p className={`font-semibold ${
                  isLessThanOneHour(race.date, race.time)
                    ? 'text-red-700'
                    : 'text-blue-700'
                }`}>{t('races.timeRemaining')}: {timeRemaining}</p>
                <p className={`text-xs mt-1 ${
                  isLessThanOneHour(race.date, race.time)
                    ? 'text-red-600'
                    : 'text-blue-600'
                }`}>{t('races.saveBeforeStart')}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right mt-3 sm:mt-0">
          <div className="text-xs sm:text-sm font-semibold">
            {t('races.round')} {race.round}
          </div>
          
          {race.completed ? (
            <span className="inline-block mt-2 px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              {t('races.completed')}
            </span>
          ) : isPast ? (
            <span className="inline-block mt-2 px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              {t('races.inProgress')}
            </span>
          ) : (
            <span className="inline-block mt-2 px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              {t('races.upcoming')}
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        {race.completed ? (
          <Link to={`/races/${race.id}/results`} className="btn btn-primary text-center">
            {t('races.viewResults')}
          </Link>
        ) : isPast ? (
          <Link to={`/races/${race.id}`} className="btn btn-primary text-center">
            {t('races.viewRace')}
          </Link>
        ) : (
          <Link to={`/${race.country.toLowerCase().replace(/\s+/g, '')}/predict`} className="btn btn-primary text-center">
            {t('races.makePredict')}
          </Link>
        )}
        
        <Link to={`/races/${race.id}`} className="btn btn-secondary text-center">
          {t('races.details')}
        </Link>
      </div>
    </div>
  );
};

export default RaceCard; 