import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Race } from '../../api/client';
import { format, parseISO } from 'date-fns';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDateLocalized, formatTimeLocalized, calculateTimeRemaining } from '../../utils/timeUtils';

interface RaceCardProps {
  race: Race;
  isNext?: boolean;
}

const RaceCard: React.FC<RaceCardProps> = ({ race, isNext = false }) => {
  const { t, language } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  const raceDate = parseISO(race.date);
  
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
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{race.raceName}</h3>
          <p className="text-gray-700">{race.circuitName}</p>
          <p className="text-gray-600 text-sm">{race.locality}, {race.country}</p>
          
          <div className="mt-3">
            <p className="text-gray-800">
              <span className="font-semibold">{t('races.date')}:</span> {formattedDate}
            </p>
            <p className="text-gray-800">
              <span className="font-semibold">{t('races.time')}:</span> {formattedTime} <span className="text-xs text-gray-500">({t('races.localTime')})</span>
            </p>
            
            {canPredict && timeRemaining && (
              <div className="mt-2 bg-blue-50 p-2 rounded text-sm text-gray-800">
                <p className="font-semibold text-blue-700">{t('races.timeRemaining')}: {timeRemaining}</p>
                <p className="text-xs text-blue-600 mt-1">{t('races.saveBeforeStart')}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-semibold">
            {t('races.round')} {race.round}
          </div>
          
          {race.completed ? (
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              {t('races.completed')}
            </span>
          ) : isPast ? (
            <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              {t('races.inProgress')}
            </span>
          ) : (
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              {t('races.upcoming')}
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        {race.completed ? (
          <Link to={`/races/${race.id}/results`} className="btn btn-primary">
            {t('races.viewResults')}
          </Link>
        ) : isPast ? (
          <Link to={`/races/${race.id}`} className="btn btn-primary">
            {t('races.viewRace')}
          </Link>
        ) : (
          <Link to={`/races/${race.id}/predict`} className="btn btn-primary">
            {t('races.makePredict')}
          </Link>
        )}
        
        <Link to={`/races/${race.id}`} className="btn btn-secondary">
          {t('races.details')}
        </Link>
      </div>
      
      {isNext && (
        <div className="absolute -top-3 -right-3 bg-f1-red text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
          {t('races.nextRace')}
        </div>
      )}
    </div>
  );
};

export default RaceCard; 