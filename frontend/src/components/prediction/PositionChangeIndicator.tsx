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

  const change = previousPosition - currentPosition; // Positive = gained positions, negative = lost positions

  if (change === 0) {
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-gray-500 ${className}`}>
        -
      </span>
    );
  }

  if (change > 0) {
    // Gained positions (green up arrow)
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-green-600 bg-green-100 rounded ${className}`}>
        ↑ {change}
      </span>
    );
  } else {
    // Lost positions (red down arrow)
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-red-600 bg-red-100 rounded ${className}`}>
        ↓ {Math.abs(change)}
      </span>
    );
  }
};

export default PositionChangeIndicator;
