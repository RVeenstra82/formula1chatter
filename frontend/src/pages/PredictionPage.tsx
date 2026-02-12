import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Race } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import PredictionForm from '../components/prediction/PredictionForm';
import DriverSelect from '../components/prediction/DriverSelect';
import { calculateTimeRemaining, isLessThanOneHour, isLessThanFiveMinutes, hasRaceStarted, formatTimeWithoutSeconds } from '../utils/timeUtils';

const PredictionPage: React.FC = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const navigate = useNavigate();
  const { user, login, isLoading: isLoadingAuth } = useAuth();
  const { t, language } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const { data: race, isLoading: isLoadingRace } = useQuery<Race>({
    queryKey: ['race', raceId],
    queryFn: () => api.getRaceById(raceId!),
    enabled: !!raceId,
  });

  // Fetch active drivers for this race
  const { data: drivers = [] } = useQuery({
    queryKey: ['active-drivers', raceId],
    queryFn: () => api.getActiveDriversForRace(raceId!),
    enabled: !!raceId,
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

  if (!raceId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">{t('common.error')}</h1>
        <p className="mb-8">Race ID is required</p>
        <Link to="/races" className="btn btn-primary">
          {t('races.viewAllRaces')}
        </Link>
      </div>
    );
  }
  
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
          onClick={login} 
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
      
      {/* Sprint Weekend Badge */}
      {race.isSprintWeekend && (
        <div className="mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-lg font-semibold">
            🏁 {t('races.sprintWeekend')}
          </div>
          <p className="mt-2 text-gray-600">
            {t('predict.sprintWeekendInfo')}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
                    {/* Weekend Prediction Header */}
          <div className="mb-6">
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
              <p className="text-blue-800 text-lg font-medium">
                {t('predict.makePredictionFor')} {race.raceName}!
              </p>
            </div>
          </div>

          {/* Sprint Prediction Form */}
          {race.isSprintWeekend && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-blue-700">
                🏁 {t('predict.sprintPrediction')} - {t('races.saturday')}
              </h2>
              <div className="card p-6 bg-blue-50 border border-blue-200">
                <p className="text-blue-700 mb-4">
                  {t('predict.sprintPredictionInfo')}
                </p>
                <div className="space-y-4">
                  <DriverSelect
                    id="sprint-first-place"
                    label={`${t('predict.firstPlace')} (3 ${t('common.points')})`}
                    drivers={drivers}
                    value=""
                    onChange={() => {}} // TODO: Handle sprint prediction changes
                    disabled={false}
                    disabledReasons={{}}
                  />
                  <DriverSelect
                    id="sprint-second-place"
                    label={`${t('predict.secondPlace')} (2 ${t('common.points')})`}
                    drivers={drivers}
                    value=""
                    onChange={() => {}} // TODO: Handle sprint prediction changes
                    disabled={false}
                    disabledReasons={{}}
                  />
                  <DriverSelect
                    id="sprint-third-place"
                    label={`${t('predict.thirdPlace')} (1 ${t('common.point')})`}
                    drivers={drivers}
                    value=""
                    onChange={() => {}} // TODO: Handle sprint prediction changes
                    disabled={false}
                    disabledReasons={{}}
                  />
                  <button className="w-full btn btn-primary bg-blue-600 hover:bg-blue-700">
                    {t('predict.submitSprintPrediction')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Race Prediction Form */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">
              🏎️ {t('predict.racePrediction')} - {t('races.sunday')}
            </h2>
            <PredictionForm
              race={race}
              onSuccess={() => {
                navigate(`/races/${race.id}`);
              }}
            />
          </div>
        </div>
        
        <div>
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">{t('race.raceInfo')}</h2>
            
            {/* Sprint Weekend Information */}
            {race.isSprintWeekend && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  🏁 {t('races.sprintWeekend')}
                </h3>
                <div className="space-y-2 text-sm">
                  {race.sprintQualifyingDate && (
                    <p>
                      <span className="font-semibold">{t('races.sprintQualifying')}:</span> {new Date(race.sprintQualifyingDate).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} {t('common.at')} {formatTimeWithoutSeconds(race.sprintQualifyingTime)}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">{t('races.sprint')}:</span> {race.sprintDate && new Date(race.sprintDate).toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} {t('common.at')} {formatTimeWithoutSeconds(race.sprintTime)}
                  </p>
                </div>
              </div>
            )}
            
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