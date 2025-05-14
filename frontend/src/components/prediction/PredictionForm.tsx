import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { Driver, Prediction, Race } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import DriverSelect from './DriverSelect';

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
  
  // Fetch drivers
  const { data: drivers = [], isLoading: isLoadingDrivers } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: api.getAllDrivers,
  });
  
  // Fetch existing prediction if any
  const { data: existingPrediction, isLoading: isLoadingPrediction } = useQuery({
    queryKey: ['prediction', user?.id, race.id],
    queryFn: () => api.getUserPredictionForRace(user!.id, race.id),
    enabled: !!user,
  });
  
  // Update prediction state when existing prediction is loaded
  useEffect(() => {
    if (existingPrediction) {
      setPrediction(existingPrediction);
    }
  }, [existingPrediction]);
  
  // Mutation to save prediction
  const { mutate: savePrediction, isPending: isSaving } = useMutation({
    mutationFn: () => api.savePrediction(user!.id, race.id, prediction),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    savePrediction();
  };
  
  const handleDriverChange = (field: keyof Prediction, driverId: string) => {
    setPrediction((prev) => ({
      ...prev,
      [field]: driverId,
    }));
  };
  
  const isLoading = isLoadingDrivers || isLoadingPrediction;
  const isPast = new Date(race.date) < new Date();
  const isDisabled = isLoading || isSaving || race.completed || isPast;
  
  if (isLoading) {
    return <div className="card p-6">{t('common.loading')}</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="text-2xl font-bold mb-6">{t('predict.yourPrediction')}</h2>
      
      {race.completed ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-6">
          {t('predict.raceComplete')}
        </div>
      ) : isPast ? (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-6">
          {t('predict.raceStarted')}
        </div>
      ) : (
        <div className="bg-blue-100 text-blue-800 p-4 rounded-md mb-6">
          {t('predict.makeFor')} {race.raceName}!
        </div>
      )}
      
      <DriverSelect
        id="first-place"
        label={t('predict.firstPlace')}
        drivers={drivers}
        value={prediction.firstPlaceDriverId}
        onChange={(driverId) => handleDriverChange('firstPlaceDriverId', driverId)}
        disabled={isDisabled}
      />
      
      <DriverSelect
        id="second-place"
        label={t('predict.secondPlace')}
        drivers={drivers}
        value={prediction.secondPlaceDriverId}
        onChange={(driverId) => handleDriverChange('secondPlaceDriverId', driverId)}
        disabled={isDisabled}
      />
      
      <DriverSelect
        id="third-place"
        label={t('predict.thirdPlace')}
        drivers={drivers}
        value={prediction.thirdPlaceDriverId}
        onChange={(driverId) => handleDriverChange('thirdPlaceDriverId', driverId)}
        disabled={isDisabled}
      />
      
      <DriverSelect
        id="fastest-lap"
        label={t('predict.fastestLap')}
        drivers={drivers}
        value={prediction.fastestLapDriverId}
        onChange={(driverId) => handleDriverChange('fastestLapDriverId', driverId)}
        disabled={isDisabled}
      />
      
      <DriverSelect
        id="driver-of-the-day"
        label={t('predict.driverOfDay')}
        drivers={drivers}
        value={prediction.driverOfTheDayId}
        onChange={(driverId) => handleDriverChange('driverOfTheDayId', driverId)}
        disabled={isDisabled}
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