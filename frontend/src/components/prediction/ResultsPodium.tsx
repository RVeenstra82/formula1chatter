import React from 'react';
import type { PredictionResult } from '../../api/client';

interface ResultsPodiumProps {
  results: PredictionResult[];
}

const ResultsPodium: React.FC<ResultsPodiumProps> = ({ results }) => {
  const topResults = results.slice(0, 3);

  const getResultForPosition = (position: number) => {
    return topResults[position - 1] || null;
  };

  const firstPlace = getResultForPosition(1);
  const secondPlace = getResultForPosition(2);
  const thirdPlace = getResultForPosition(3);

  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold text-center mb-8 text-white uppercase tracking-f1">Prediction Podium</h2>

      <div className="podium relative">
        {/* Second Place */}
        <div className="podium-place podium-2nd">
          {secondPlace && (
            <>
              <div className="mb-4 text-center">
                <div className="flex justify-center mb-2">
                  <img
                    src={secondPlace.profilePictureUrl || '/placeholder-user.png'}
                    alt={secondPlace.userName}
                    className="w-16 h-16 profile-pic"
                  />
                </div>
                <div className="font-bold text-white">{secondPlace.userName}</div>
                <div className="text-sm text-slate-400">{secondPlace.score} pts</div>
              </div>
              <div className="podium-stand flex items-center justify-center">2</div>
            </>
          )}
        </div>

        {/* First Place */}
        <div className="podium-place podium-1st">
          {firstPlace && (
            <>
              <div className="mb-4 text-center">
                <div className="flex justify-center mb-2">
                  <img
                    src={firstPlace.profilePictureUrl || '/placeholder-user.png'}
                    alt={firstPlace.userName}
                    className="w-20 h-20 profile-pic"
                  />
                </div>
                <div className="font-bold text-lg text-white">{firstPlace.userName}</div>
                <div className="text-slate-400">{firstPlace.score} pts</div>
              </div>
              <div className="podium-stand flex items-center justify-center">1</div>
            </>
          )}
        </div>

        {/* Third Place */}
        <div className="podium-place podium-3rd">
          {thirdPlace && (
            <>
              <div className="mb-4 text-center">
                <div className="flex justify-center mb-2">
                  <img
                    src={thirdPlace.profilePictureUrl || '/placeholder-user.png'}
                    alt={thirdPlace.userName}
                    className="w-14 h-14 profile-pic"
                  />
                </div>
                <div className="font-bold text-white">{thirdPlace.userName}</div>
                <div className="text-sm text-slate-400">{thirdPlace.score} pts</div>
              </div>
              <div className="podium-stand flex items-center justify-center">3</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPodium;
