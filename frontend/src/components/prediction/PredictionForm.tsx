import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { Driver, Prediction, Race } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import DriverSelect from './DriverSelect';
import { isLessThanFiveMinutes, hasRaceStarted } from '../../utils/timeUtils';

interface PredictionFormProps {
  race: Race;
  onSuccess?: () => void;
}

const PredictionForm: React.FC<PredictionFormProps> = ({ race, onSuccess }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [prediction, setPrediction] = useState<Prediction>({
    firstPlaceDriverId: '',
    secondPlaceDriverId: '',
    thirdPlaceDriverId: '',
    fastestLapDriverId: '',
    driverOfTheDayId: '',
  });
  
  // Fetch active drivers for this race
  const { data: drivers = [], isLoading: isLoadingDrivers } = useQuery<Driver[]>({
    queryKey: ['active-drivers', race.id],
    queryFn: () => api.getActiveDriversForRace(race.id),
  });
  
  // Fetch existing prediction if any
  const { data: existingPrediction, isLoading: isLoadingPrediction } = useQuery({
    queryKey: ['prediction', user?.id, race.id],
    queryFn: () => api.getUserPredictionForRace(user!.id, race.id),
    enabled: !!user && user.id !== undefined && user.id !== null,
  });
  
  // Update prediction state when existing prediction is loaded
  useEffect(() => {
    if (existingPrediction) {
      setPrediction(existingPrediction);
    }
  }, [existingPrediction]);
  
  // Mutation to save prediction
  const { mutate: savePrediction, isPending: isSaving, error: saveError } = useMutation({
    mutationFn: () => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      return api.savePrediction(race.id, prediction);
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.id === undefined || user.id === null) {
      console.error('Cannot submit prediction: user not authenticated');
      return;
    }
    savePrediction();
  };
  
  const handleDriverChange = (field: keyof Prediction, driverId: string) => {
    setPrediction((prev) => ({
      ...prev,
      [field]: driverId,
    }));
  };

  // Build disabled reasons for top-3 only (first/second/third). 
  // Fastest lap and driver of the day may reuse the same driver.
  const disabledTop3: Record<string, string> = {};
  const top3Selected: Array<[string, keyof Prediction]> = [
    [prediction.firstPlaceDriverId, 'firstPlaceDriverId'],
    [prediction.secondPlaceDriverId, 'secondPlaceDriverId'],
    [prediction.thirdPlaceDriverId, 'thirdPlaceDriverId'],
  ];
  const fieldLabels: Record<keyof Prediction, string> = {
    firstPlaceDriverId: t('predict.firstPlaceShort'),
    secondPlaceDriverId: t('predict.secondPlaceShort'),
    thirdPlaceDriverId: t('predict.thirdPlaceShort'),
    fastestLapDriverId: t('predict.fastestLap'),
    driverOfTheDayId: t('predict.driverOfDay'),
  };
  top3Selected.forEach(([driverId, field]) => {
    if (driverId) {
      disabledTop3[driverId] = fieldLabels[field];
    }
  });
  
  const isLoading = isLoadingDrivers || isLoadingPrediction;
  const isPast = hasRaceStarted(race.date, race.time);
  const isWithinFiveMinutes = isLessThanFiveMinutes(race.date, race.time);
  const isNotAuthenticated = !user || user.id === undefined || user.id === null;
  const isDisabled = isLoading || isSaving || race.completed || isPast || isWithinFiveMinutes || isNotAuthenticated;

  if (isLoading) {
    return <div className="card p-6 text-slate-300">{t('common.loading')}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-2xl font-bold text-white mb-6">{t('predict.yourPrediction')}</h2>

      {race.completed ? (
        <div className="bg-f1-surface-elevated text-slate-300 p-4 rounded-lg border border-f1-border mb-6">
          {t('predict.raceComplete')}
        </div>
      ) : isPast ? (
        <div className="bg-f1-surface-elevated text-slate-300 p-4 rounded-lg border border-f1-border mb-6">
          {t('predict.raceStarted')}
        </div>
      ) : isWithinFiveMinutes ? (
        <div className="bg-red-500/10 text-f1-red p-4 rounded-lg border border-red-500/30 mb-6">
          {t('predict.noMorePredictions')}
        </div>
      ) : isNotAuthenticated ? (
        <div className="bg-f1-surface-elevated text-slate-300 p-4 rounded-lg border border-f1-border mb-6">
          Please log in to make predictions
        </div>
      ) : null}

      {saveError && (
        <div className="bg-red-500/10 text-f1-red p-4 rounded-lg border border-red-500/30 mb-6">
          {saveError.message?.includes('not authenticated')
            ? 'Please log in to make predictions'
            : t('predict.noMorePredictions')}
        </div>
      )}
      
      <DriverSelect
        id="first-place"
        label={t('predict.firstPlace')}
        drivers={drivers}
        value={prediction.firstPlaceDriverId}
        onChange={(driverId) => handleDriverChange('firstPlaceDriverId', driverId)}
        disabled={isDisabled}
        disabledReasons={disabledTop3}
      />
      
      <DriverSelect
        id="second-place"
        label={t('predict.secondPlace')}
        drivers={drivers}
        value={prediction.secondPlaceDriverId}
        onChange={(driverId) => handleDriverChange('secondPlaceDriverId', driverId)}
        disabled={isDisabled}
        disabledReasons={disabledTop3}
      />
      
      <DriverSelect
        id="third-place"
        label={t('predict.thirdPlace')}
        drivers={drivers}
        value={prediction.thirdPlaceDriverId}
        onChange={(driverId) => handleDriverChange('thirdPlaceDriverId', driverId)}
        disabled={isDisabled}
        disabledReasons={disabledTop3}
      />
      
      <DriverSelect
        id="fastest-lap"
        label={t('predict.fastestLap')}
        drivers={drivers}
        value={prediction.fastestLapDriverId}
        onChange={(driverId) => handleDriverChange('fastestLapDriverId', driverId)}
        disabled={isDisabled}
        disabledReasons={{}}
      />
      
      <DriverSelect
        id="driver-of-the-day"
        label={t('predict.driverOfDay')}
        drivers={drivers}
        value={prediction.driverOfTheDayId}
        onChange={(driverId) => handleDriverChange('driverOfTheDayId', driverId)}
        disabled={isDisabled}
        disabledReasons={{}}
      />
      
      <div className="mt-8">
        <button 
          type="submit" 
          className="btn btn-primary w-full"
          disabled={isDisabled}
        >
          {isSaving ? t('common.loading') : t('predict.submit')}
        </button>
      </div>
    </form>
  );
};

export default PredictionForm; 