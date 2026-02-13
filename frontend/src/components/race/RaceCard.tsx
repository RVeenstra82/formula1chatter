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

  const formattedDate = formatDateLocalized(race.date, 'PPP', language);

  const formattedTime = race.time
    ? formatTimeLocalized(race.time, language === 'nl' ? 'HH:mm' : 'h:mm a', language)
    : 'TBA';

  const hasStarted = hasRaceStarted(race.date, race.time);
  const canPredict = !race.completed && !hasStarted;

  // Only show countdown for races within 14 days
  const isWithin14Days = (() => {
    const raceStartDate = new Date(`${race.date}T${race.time || '00:00:00'}Z`);
    const now = new Date();
    const diffMs = raceStartDate.getTime() - now.getTime();
    return diffMs > 0 && diffMs < 14 * 24 * 60 * 60 * 1000;
  })();
  const showCountdown = canPredict && isWithin14Days;

  useEffect(() => {
    if (!showCountdown) return;

    const updateTimeRemaining = () => {
      setTimeRemaining(calculateTimeRemaining(race.date, race.time, language));
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [race.date, race.time, language, showCountdown]);

  // Build weekend schedule sessions for the timetable
  const timeFormat = language === 'nl' ? 'HH:mm' : 'h:mm a';
  const weekendSessions: { label: string; date?: string; time?: string; highlight?: boolean }[] = [];

  if (isNext) {
    if (race.isSprintWeekend) {
      // Sprint weekends: FP1, SQ, Sprint, Quali, Race
      if (race.practice1Date && race.practice1Time)
        weekendSessions.push({ label: t('race.practice1'), date: race.practice1Date, time: race.practice1Time });
      if (race.sprintQualifyingDate && race.sprintQualifyingTime)
        weekendSessions.push({ label: t('races.sprintQualifying'), date: race.sprintQualifyingDate, time: race.sprintQualifyingTime });
      if (race.sprintDate && race.sprintTime)
        weekendSessions.push({ label: t('races.sprint'), date: race.sprintDate, time: race.sprintTime });
      if (race.qualifyingDate && race.qualifyingTime)
        weekendSessions.push({ label: t('race.qualifying'), date: race.qualifyingDate, time: race.qualifyingTime });
    } else {
      // Standard weekends: FP1, FP2, FP3, Quali, Race
      if (race.practice1Date && race.practice1Time)
        weekendSessions.push({ label: t('race.practice1'), date: race.practice1Date, time: race.practice1Time });
      if (race.practice2Date && race.practice2Time)
        weekendSessions.push({ label: t('race.practice2'), date: race.practice2Date, time: race.practice2Time });
      if (race.practice3Date && race.practice3Time)
        weekendSessions.push({ label: t('race.practice3'), date: race.practice3Date, time: race.practice3Time });
      if (race.qualifyingDate && race.qualifyingTime)
        weekendSessions.push({ label: t('race.qualifying'), date: race.qualifyingDate, time: race.qualifyingTime });
    }
    // Always add the race itself
    weekendSessions.push({ label: t('races.race'), date: race.date, time: race.time, highlight: true });
  }

  return (
    <div className={`${isNext ? 'card-carbon' : 'card'} transition-all duration-300 hover:border-slate-500`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-white">{race.raceName}</h3>
          <p className="text-slate-400 text-sm sm:text-base">{race.circuitName}</p>
          <p className="text-slate-400 text-xs sm:text-sm">{race.locality}, {race.country}</p>

          <div className="mt-3">
            <p className="text-slate-300 text-sm sm:text-base">
              <span className="font-semibold text-white">{t('races.date')}:</span> {formattedDate}
            </p>
            <p className="text-slate-300 text-sm sm:text-base">
              <span className="font-semibold text-white">{t('races.time')}:</span> {formattedTime} <span className="text-xs text-slate-500">({t('races.localTime')})</span>
            </p>

            {showCountdown && timeRemaining && (
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
              <span className="badge-green">
                {t('races.sprintWeekend')}
              </span>
            </div>
          )}

          {race.completed ? (
            <span className="badge-green mt-2">
              {t('races.completed')}
            </span>
          ) : hasStarted ? (
            <span className="badge-yellow mt-2">
              {t('races.inProgress')}
            </span>
          ) : (
            <span className="badge-blue mt-2">
              {t('races.upcoming')}
            </span>
          )}
        </div>
      </div>

      {/* Weekend timetable (featured next race only) */}
      {isNext && weekendSessions.length > 1 && (
        <div className="mt-4 pt-4 border-t border-f1-border">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-f1 mb-3">
            {t('race.weekendSchedule')}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {weekendSessions.map((session) => (
              <div
                key={session.label}
                className={`rounded px-3 py-2 text-center ${
                  session.highlight
                    ? 'bg-f1-red/15 border border-f1-red/30'
                    : 'bg-f1-surface-elevated'
                }`}
              >
                <p className={`text-xs font-semibold mb-0.5 ${session.highlight ? 'text-red-400' : 'text-slate-400'}`}>
                  {session.label}
                </p>
                {session.date && (
                  <p className="text-xs text-slate-500">
                    {formatDateLocalized(session.date, 'EEE d MMMM', language)}
                  </p>
                )}
                {session.time && (
                  <p className={`text-sm font-medium ${session.highlight ? 'text-white' : 'text-slate-200'}`}>
                    {formatTimeLocalized(session.time, timeFormat, language)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
