import React from 'react';

interface PositionChangeIndicatorProps {
  currentPosition?: number;
  previousPosition?: number;
  className?: string;
}

const PositionChangeIndicator: React.FC<PositionChangeIndicatorProps> = ({
  currentPosition,
  previousPosition,
  className = ''
}) => {
  if (!currentPosition || !previousPosition) {
    return null;
  }

  const change = previousPosition - currentPosition;

  if (change === 0) {
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-slate-500 ${className}`}>
        -
      </span>
    );
  }

  if (change > 0) {
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-green-400 bg-green-500/20 rounded ${className}`}>
        ↑ {change}
      </span>
    );
  } else {
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-red-400 bg-red-500/20 rounded ${className}`}>
        ↓ {Math.abs(change)}
      </span>
    );
  }
};

export default PositionChangeIndicator;
