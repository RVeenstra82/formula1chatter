import React from 'react';
import type { Driver } from '../../api/client';

interface DriverSelectProps {
  drivers: Driver[];
  value: string;
  onChange: (driverId: string) => void;
  label: string;
  id: string;
  disabled?: boolean;
}

const DriverSelect: React.FC<DriverSelectProps> = ({
  drivers,
  value,
  onChange,
  label,
  id,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select w-full"
        disabled={disabled}
      >
        <option value="">Select a driver</option>
        {drivers.map((driver) => (
          <option key={driver.id} value={driver.id}>
            {driver.firstName} {driver.lastName} {driver.constructorName ? `(${driver.constructorName})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DriverSelect; 