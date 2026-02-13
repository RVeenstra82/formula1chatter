import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Race, Driver, Prediction } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatDateLocalized, formatTimeLocalized, calculateTimeRemaining, isLessThanOneHour, hasRaceStarted } from '../utils/timeUtils';


const RaceDetailPage: React.FC = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(
    !!(location.state as { predictionSaved?: boolean } | null)?.predictionSaved
  );

  // Clear router state so refresh doesn't re-show banner
  useEffect(() => {
    if ((location.state as { predictionSaved?: boolean } | null)?.predictionSaved) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-dismiss banner after 5 seconds
  useEffect(() => {
    if (!showSuccessBanner) return;
    const timer = setTimeout(() => setShowSuccessBanner(false), 5000);
    return () => clearTimeout(timer);
  }, [showSuccessBanner]);

  const { data: race, isLoading: isLoadingRace } = useQuery<Race>({
    queryKey: ['race', raceId],
    queryFn: () => api.getRaceById(raceId!),
    enabled: !!raceId,
  });

  const { data: drivers, isLoading: isLoadingDrivers } = useQuery<Driver[]>({
    queryKey: ['active-drivers', raceId],
    queryFn: () => api.getActiveDriversForRace(raceId!),
    enabled: !!raceId,
  });

  const { data: userPrediction } = useQuery<Prediction | null>({
    queryKey: ['user-prediction', user?.id, raceId],
    queryFn: () => api.getUserPredictionForRace(user!.id, raceId!),
    enabled: !!user && !!raceId,
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

  if (!raceId) {
    return <div>{t('common.raceIdRequired')}</div>;
  }

  if (isLoadingRace || isLoadingDrivers) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-f1-surface-elevated rounded w-1/2 mb-4"></div>
        <div className="h-6 bg-f1-surface-elevated rounded w-1/3 mb-8"></div>
        <div className="card h-96"></div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-white mb-4">{t('common.notFound')}</h1>
        <p className="text-slate-300 mb-8">{t('races.notFound')}</p>
        <Link to="/races" className="btn btn-primary">
          {t('races.viewAllRaces')}
        </Link>
      </div>
    );
  }
  
  // Format date based on locale
  const formattedDate = formatDateLocalized(race.date, 'PPP', language);
  
  // Format time based on locale
  const timeFormat = language === 'nl' ? 'HH:mm' : 'h:mm a';
  const formattedTime = race.time
    ? formatTimeLocalized(race.time, timeFormat, language)
    : t('common.tba');
  
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

  const renderPredictionRow = (
    position: string,
    predDriverId: string,
    actualDriverId: string | null,
    badgeClass: string,
  ) => {
    const driver = getDriverById(predDriverId);
    const isCorrect = race.completed && actualDriverId === predDriverId;
    const isWrong = race.completed && actualDriverId !== predDriverId;

    return (
      <div key={position} className={`flex items-center gap-3 p-2.5 rounded ${isCorrect ? 'bg-green-950/40' : isWrong ? 'bg-red-950/30' : 'bg-black/30'}`}>
        <span className={`w-7 h-7 rounded-full ${badgeClass} text-xs font-bold flex items-center justify-center shrink-0`}>
          {position}
        </span>
        <div className="flex-1 min-w-0">
          {driver ? (
            <>
              <div className="text-white text-sm font-semibold truncate">{driver.firstName} {driver.lastName}</div>
              <div className="text-slate-500 text-xs">{driver.constructorName}</div>
            </>
          ) : (
            <div className="text-slate-500 text-sm">—</div>
          )}
        </div>
        {race.completed && (
          <span className={`text-lg ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✓' : '✗'}
          </span>
        )}
      </div>
    );
  };

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
            {userPrediction ? t('prediction.editPrediction') : t('races.makePredict')}
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

      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="mb-6 p-4 bg-green-950/50 border border-green-500/50 rounded-lg flex items-center justify-between">
          <p className="text-green-400 font-semibold">{t('prediction.predictionSaved')}</p>
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="text-green-400 hover:text-green-300 ml-4 text-xl leading-none"
            aria-label={t('common.close')}
          >
            &times;
          </button>
        </div>
      )}

      <div className="card mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{race.raceName}</h1>
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="inline-block px-3 py-1 bg-f1-surface-elevated text-slate-200 rounded-full text-sm font-semibold">
            {t('races.round')} {race.round}
          </span>
          <span className="inline-block px-3 py-1 bg-f1-surface-elevated text-slate-200 rounded-full text-sm font-semibold">
            {t('races.season')} {race.season}
          </span>
          {race.completed ? (
            <span className="badge-green">
              {t('races.completed')}
            </span>
          ) : started ? (
            <span className="badge-yellow">
              {t('races.inProgress')}
            </span>
          ) : (
            <span className="badge-blue">
              {t('races.upcoming')}
            </span>
          )}
        </div>

        <div className={`grid grid-cols-1 ${user ? 'lg:grid-cols-[1fr_1fr_280px]' : 'lg:grid-cols-2'} gap-6 mb-6`}>
          {/* Column 1: Circuit info + Race schedule */}
          <div>
            <div className="mb-6">
              <h2 className="racing-stripe text-xl font-bold text-white mb-3">{t('race.circuitInfo')}</h2>
              <p className="text-slate-300">{race.circuitName}</p>
              <p className="text-slate-400">{race.locality}, {race.country}</p>
            </div>

            <div>
              <h2 className="racing-stripe text-xl font-bold text-white mb-3">{t('race.raceSchedule')}</h2>
              <p className="text-slate-300">
                <span className="font-semibold">{t('races.date')}:</span> {formattedDate}
              </p>
              <p className="text-slate-300">
                <span className="font-semibold">{t('races.time')}:</span> {race.time ? formattedTime : <span className="text-slate-600 italic">{t('common.tba')}</span>} {race.time && <span className="text-xs text-slate-500">({t('races.localTime')})</span>}
              </p>

              {canPredict && timeRemaining && (
                <div className={`mt-3 p-3 rounded-lg border flex items-center gap-3 ${
                  isLessThanOneHour(race.date, race.time)
                    ? 'bg-red-950/50 border-red-500/50'
                    : 'bg-f1-surface-elevated border-f1-border'
                }`}>
                  <p className={`font-semibold text-sm whitespace-nowrap ${
                    isLessThanOneHour(race.date, race.time) ? 'text-red-400' : 'text-slate-400'
                  }`}>{t('races.timeRemaining')}:</p>
                  <p className={`font-bold ${
                    isLessThanOneHour(race.date, race.time) ? 'text-f1-red' : 'text-white'
                  }`}>{timeRemaining}</p>
                </div>
              )}
            </div>
          </div>

          {/* Prediction sidebar — pinned to right column */}
          {user && (
            <div className="order-last lg:order-none lg:col-start-3 lg:row-start-1 lg:sticky lg:top-4 self-start">
              <h2 className="racing-stripe text-xl font-bold text-white mb-4">{t('prediction.yourPrediction')}</h2>
              <div className="card-carbon">

              {userPrediction ? (
                <div className="space-y-2">
                  {renderPredictionRow('P1', userPrediction.firstPlaceDriverId, race.firstPlaceDriverId, 'bg-podium-gold/20 text-podium-gold')}
                  {renderPredictionRow('P2', userPrediction.secondPlaceDriverId, race.secondPlaceDriverId, 'bg-podium-silver/20 text-slate-300')}
                  {renderPredictionRow('P3', userPrediction.thirdPlaceDriverId, race.thirdPlaceDriverId, 'bg-podium-bronze/20 text-podium-bronze')}

                  <div className="border-t border-white/5 my-1" />

                  {renderPredictionRow('FL', userPrediction.fastestLapDriverId, race.fastestLapDriverId, 'bg-blue-500/20 text-blue-400')}
                  {renderPredictionRow('★', userPrediction.driverOfTheDayId, race.driverOfTheDayId, 'bg-purple-500/20 text-purple-400')}

                  {canPredict && (
                    <Link to={`/races/${race.id}/predict`} className="btn btn-secondary btn-sm w-full mt-3">
                      {t('prediction.editPrediction')}
                    </Link>
                  )}
                </div>
              ) : canPredict ? (
                <div>
                  <p className="text-slate-400 text-sm mb-4">{t('prediction.noPredictionCta')}</p>
                  <Link to={`/races/${race.id}/predict`} className="btn btn-primary btn-sm w-full">
                    {t('races.makePredict')}
                  </Link>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">{t('prediction.noPredictionMade')}</p>
              )}
              </div>
            </div>
          )}

          {/* Column 2: Weekend Schedule grouped by day */}
          <div>
            <h2 className="racing-stripe text-xl font-bold text-white mb-4">{t('race.weekendSchedule')}</h2>

            <div className="space-y-4">
              {/* Friday */}
              <div className="rounded-lg border border-f1-border overflow-hidden">
                <div className="bg-f1-surface-elevated px-3 py-2 border-b border-f1-border">
                  <h3 className="text-sm font-bold text-white uppercase tracking-f1">{t('races.friday')}</h3>
                </div>
                <div className="divide-y divide-f1-border">
                  {race.isSprintWeekend ? (
                    <>
                      <div className="p-3 flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{t('race.practice1')}</span>
                        <span className="text-white font-medium">
                          {race.practice1Time
                            ? formatTimeLocalized(race.practice1Time, timeFormat, language)
                            : <span className="text-slate-600 italic">{t('common.tba')}</span>}
                        </span>
                      </div>
                      <div className="p-3 flex justify-between items-center bg-purple-500/5">
                        <span className="font-semibold text-purple-400">{t('races.sprintQualifying')}</span>
                        <span className="text-purple-300 font-medium">
                          {race.sprintQualifyingTime
                            ? formatTimeLocalized(race.sprintQualifyingTime, timeFormat, language)
                            : <span className="text-slate-600 italic">{t('common.tba')}</span>}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{t('race.practice1')}</span>
                        <span className="text-white font-medium">
                          {race.practice1Time
                            ? formatTimeLocalized(race.practice1Time, timeFormat, language)
                            : <span className="text-slate-600 italic">{t('common.tba')}</span>}
                        </span>
                      </div>
                      <div className="p-3 flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{t('race.practice2')}</span>
                        <span className="text-white font-medium">
                          {race.practice2Time
                            ? formatTimeLocalized(race.practice2Time, timeFormat, language)
                            : <span className="text-slate-600 italic">{t('common.tba')}</span>}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Saturday */}
              <div className="rounded-lg border border-f1-border overflow-hidden">
                <div className="bg-f1-surface-elevated px-3 py-2 border-b border-f1-border">
                  <h3 className="text-sm font-bold text-white uppercase tracking-f1">{t('races.saturday')}</h3>
                </div>
                <div className="divide-y divide-f1-border">
                  {race.isSprintWeekend ? (
                    <>
                      <div className="p-3 flex justify-between items-center bg-purple-500/5">
                        <span className="font-semibold text-purple-400">{t('races.sprint')}</span>
                        <span className="text-purple-300 font-medium">
                          {race.sprintTime
                            ? formatTimeLocalized(race.sprintTime, timeFormat, language)
                            : <span className="text-slate-600 italic">{t('common.tba')}</span>}
                        </span>
                      </div>
                      <div className="p-3 flex justify-between items-center border-l-2 border-l-f1-red">
                        <span className="font-semibold text-slate-200">{t('race.qualifying')}</span>
                        <span className="text-white font-medium">
                          {race.qualifyingTime
                            ? formatTimeLocalized(race.qualifyingTime, timeFormat, language)
                            : <span className="text-slate-600 italic">{t('common.tba')}</span>}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 flex justify-between items-center">
                        <span className="font-semibold text-slate-200">{t('race.practice3')}</span>
                        <span className="text-white font-medium">
                          {race.practice3Time
                            ? formatTimeLocalized(race.practice3Time, timeFormat, language)
                            : <span className="text-slate-600 italic">{t('common.tba')}</span>}
                        </span>
                      </div>
                      <div className="p-3 flex justify-between items-center border-l-2 border-l-f1-red">
                        <span className="font-semibold text-slate-200">{t('race.qualifying')}</span>
                        <span className="text-white font-medium">
                          {race.qualifyingTime
                            ? formatTimeLocalized(race.qualifyingTime, timeFormat, language)
                            : <span className="text-slate-600 italic">{t('common.tba')}</span>}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Sunday */}
              <div className="rounded-lg border border-f1-red/30 overflow-hidden">
                <div className="bg-f1-red/15 px-3 py-2 border-b border-f1-red/30">
                  <h3 className="text-sm font-bold text-red-400 uppercase tracking-f1">{t('races.sunday')}</h3>
                </div>
                <div className="p-3 flex justify-between items-center bg-f1-red/5">
                  <span className="font-semibold text-white">{t('races.race')}</span>
                  <span className={race.time ? 'text-white font-bold' : 'text-slate-600 italic'}>
                    {race.time ? formattedTime : t('common.tba')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {race.completed && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">{t('race.results')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {firstPlaceDriver && (
                <div className="card bg-podium-gold/10 border border-podium-gold/50">
                  <div className="text-center font-bold text-podium-gold mb-2">{t('race.firstPlace')}</div>
                  <div className="text-lg font-semibold text-white">{firstPlaceDriver.firstName} {firstPlaceDriver.lastName}</div>
                  <div className="text-slate-400">{firstPlaceDriver.constructorName}</div>
                </div>
              )}

              {secondPlaceDriver && (
                <div className="card bg-podium-silver/10 border border-podium-silver/50">
                  <div className="text-center font-bold text-slate-400 mb-2">{t('race.secondPlace')}</div>
                  <div className="text-lg font-semibold text-white">{secondPlaceDriver.firstName} {secondPlaceDriver.lastName}</div>
                  <div className="text-slate-400">{secondPlaceDriver.constructorName}</div>
                </div>
              )}

              {thirdPlaceDriver && (
                <div className="card bg-podium-bronze/10 border border-podium-bronze/50">
                  <div className="text-center font-bold text-podium-bronze mb-2">{t('race.thirdPlace')}</div>
                  <div className="text-lg font-semibold text-white">{thirdPlaceDriver.firstName} {thirdPlaceDriver.lastName}</div>
                  <div className="text-slate-400">{thirdPlaceDriver.constructorName}</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {fastestLapDriver && (
                <div className="card bg-blue-950/50 border border-blue-500/30">
                  <div className="text-center font-bold text-blue-400 mb-2">{t('race.fastestLap')}</div>
                  <div className="text-lg font-semibold text-white">{fastestLapDriver.firstName} {fastestLapDriver.lastName}</div>
                  <div className="text-slate-400">{fastestLapDriver.constructorName}</div>
                </div>
              )}

              {driverOfTheDayDriver && (
                <div className="card bg-purple-500/20 border border-purple-500/30">
                  <div className="text-center font-bold text-purple-400 mb-2">{t('race.driverOfDay')}</div>
                  <div className="text-lg font-semibold text-white">{driverOfTheDayDriver.firstName} {driverOfTheDayDriver.lastName}</div>
                  <div className="text-slate-400">{driverOfTheDayDriver.constructorName}</div>
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