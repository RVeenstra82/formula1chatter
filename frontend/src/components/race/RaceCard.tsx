import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Race } from '../../api/client';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDateLocalized, formatTimeLocalized, calculateTimeRemaining, isLessThanOneHour, hasRaceStarted } from '../../utils/timeUtils';

interface RaceCardProps {
  race: Race;
  isNext?: boolean;
}

const RaceCard: React.FC<RaceCardProps> = ({ race, isNext = false }) => {
  const { t, language } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const formattedDate = formatDateLocalized(race.date, 'PP', language);

  const formattedTime = race.time
    ? formatTimeLocalized(race.time, language === 'nl' ? 'HH:mm' : 'h:mm a', language)
    : 'TBA';

  const hasStarted = hasRaceStarted(race.date, race.time);
  const canPredict = !race.completed && !hasStarted;

  useEffect(() => {
    if (!canPredict) return;

    const updateTimeRemaining = () => {
      setTimeRemaining(calculateTimeRemaining(race.date, race.time, language));
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [race.date, race.time, language, canPredict]);

  return (
    <div className={`${isNext ? 'card-featured' : 'card'} transition-all duration-300 hover:border-f1-border`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-white">{race.raceName}</h3>
          <p className="text-slate-400 text-sm sm:text-base">{race.circuitName}</p>
          <p className="text-slate-500 text-xs sm:text-sm">{race.locality}, {race.country}</p>

          <div className="mt-3">
            <p className="text-slate-300 text-sm sm:text-base">
              <span className="font-semibold text-white">{t('races.date')}:</span> {formattedDate}
            </p>
            <p className="text-slate-300 text-sm sm:text-base">
              <span className="font-semibold text-white">{t('races.time')}:</span> {formattedTime} <span className="text-xs text-slate-500">({t('races.localTime')})</span>
            </p>

            {canPredict && timeRemaining && (
              <div className={`mt-2 p-2 rounded border text-xs sm:text-sm ${
                isLessThanOneHour(race.date, race.time)
                  ? 'bg-red-950/50 border-red-500/50 text-red-400'
                  : 'bg-blue-950/50 border-blue-500/50 text-blue-400'
              }`}>
                <p className="font-semibold">{t('races.timeRemaining')}: {timeRemaining}</p>
                <p className="text-xs mt-1 opacity-80">{t('races.saveBeforeStart')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-right mt-3 sm:mt-0">
          <div className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-f1">
            {t('races.round')} {race.round}
          </div>

          {race.isSprintWeekend && (
            <div className="mt-2">
              <span className="inline-block px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold">
                🏁 Sprint Weekend
              </span>
            </div>
          )}

          {race.completed ? (
            <span className="inline-block mt-2 px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold">
              {t('races.completed')}
            </span>
          ) : hasStarted ? (
            <span className="inline-block mt-2 px-2 sm:px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-semibold">
              {t('races.inProgress')}
            </span>
          ) : (
            <span className="inline-block mt-2 px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold">
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
        ) : hasStarted ? (
          <Link to={`/races/${race.id}`} className="btn btn-primary text-center">
            {t('races.viewRace')}
          </Link>
        ) : (
          <Link to={`/races/${race.id}/predict`} className="btn btn-primary text-center">
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
