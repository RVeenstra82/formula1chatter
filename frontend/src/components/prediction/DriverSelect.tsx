import React from 'react';
import Select from 'react-select';
import type { GroupBase, SingleValue } from 'react-select';
import type { Driver } from '../../api/client';

interface DriverSelectProps {
  drivers: Driver[];
  value: string;
  onChange: (driverId: string) => void;
  label: string;
  id: string;
  disabled?: boolean;
}

interface DriverOption {
  value: string;
  label: string;
  driver: Driver;
}

const DriverSelect: React.FC<DriverSelectProps> = ({
  drivers,
  value,
  onChange,
  label,
  id,
  disabled = false,
}) => {
  // Group drivers by constructor
  const groupedOptions: GroupBase<DriverOption>[] = Object.entries(
    drivers.reduce((acc, driver) => {
      const team = driver.constructorName || 'Independent';
      if (!acc[team]) acc[team] = [];
      acc[team].push({
        value: driver.id,
        label: `${driver.firstName} ${driver.lastName}`,
        driver,
      });
      return acc;
    }, {} as Record<string, DriverOption[]>)
  ).map(([team, options]) => ({
    label: team,
    options,
  }));

  const selectedOption = groupedOptions
    .flatMap(group => group.options)
    .find(opt => opt.value === value) || null;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
        {label}
      </label>
      <Select
        inputId={id}
        value={selectedOption}
        onChange={(option: SingleValue<DriverOption>) => {
          if (option) onChange(option.value);
        }}
        options={groupedOptions}
        isDisabled={disabled}
        isSearchable
        placeholder="Select a driver"
        formatOptionLabel={({ driver }) => (
          <div className="flex items-center gap-2">
            <img
              src={driver.profilePictureUrl ?? undefined}
              alt={`${driver.firstName} ${driver.lastName}`}
              className="w-6 h-6 rounded-full"
            />
            <span>{driver.firstName} {driver.lastName}</span>
          </div>
        )}
        styles={{
          option: (base) => ({
            ...base,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }),
        }}
      />
    </div>
  );
};

export default DriverSelect;