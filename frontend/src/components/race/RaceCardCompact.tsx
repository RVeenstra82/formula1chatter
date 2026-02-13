import React from 'react';
import { Link } from 'react-router-dom';
import type { Race } from '../../api/client';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDateLocalized, formatTimeLocalized, hasRaceStarted } from '../../utils/timeUtils';

interface RaceCardCompactProps {
  race: Race;
}

const RaceCardCompact: React.FC<RaceCardCompactProps> = ({ race }) => {
  const { t, language } = useLanguage();

  const formattedDate = formatDateLocalized(race.date, 'PPP', language);
  const formattedTime = race.time
    ? formatTimeLocalized(race.time, language === 'nl' ? 'HH:mm' : 'h:mm a', language)
    : t('common.tba');

  const hasStarted = hasRaceStarted(race.date, race.time);
  const canPredict = !race.completed && !hasStarted;

  return (
    <div className="card flex flex-col h-full transition-all duration-300 hover:border-slate-500">
      {/* Header row: name + round badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-bold text-white leading-tight truncate">
          {race.raceName}
        </h3>
        <span className="shrink-0 text-xs font-semibold text-slate-400 uppercase tracking-f1 bg-f1-surface-elevated px-2 py-0.5 rounded">
          R{race.round}
        </span>
      </div>

      {/* Circuit + location */}
      <p className="text-slate-400 text-sm truncate">{race.circuitName}</p>
      <p className="text-slate-500 text-xs truncate mb-3">{race.locality}, {race.country}</p>

      {/* Date & time */}
      <div className="text-sm text-slate-300 mb-3">
        <span className="font-semibold text-white">{formattedDate}</span>
        <span className="text-slate-500 mx-1.5">|</span>
        <span>{formattedTime}</span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {race.completed ? (
          <span className="badge-green">{t('races.completed')}</span>
        ) : hasStarted ? (
          <span className="badge-yellow">{t('races.inProgress')}</span>
        ) : (
          <span className="badge-blue">{t('races.upcoming')}</span>
        )}
        {race.isSprintWeekend && (
          <span className="badge bg-purple-500/20 text-purple-400 border-purple-500/30">
            {t('races.sprintWeekend')}
          </span>
        )}
      </div>

      {/* Spacer to push CTA to bottom */}
      <div className="mt-auto">
        {race.completed ? (
          <Link to={`/races/${race.id}/results`} className="btn btn-secondary w-full text-center text-sm">
            {t('races.viewResults')}
          </Link>
        ) : canPredict ? (
          <Link to={`/races/${race.id}/predict`} className="btn btn-outline w-full text-center text-sm">
            {t('races.makePredict')}
          </Link>
        ) : (
          <Link to={`/races/${race.id}`} className="btn btn-secondary w-full text-center text-sm">
            {t('races.viewRace')}
          </Link>
        )}
      </div>
    </div>
  );
};

export default RaceCardCompact;
