import React from 'react';
import Select from 'react-select';
import type { GroupBase, SingleValue } from 'react-select';
import type { Driver } from '../../api/client';
import { teamLogos } from '../../assets/teamLogos';
const proxy = (src?: string | null) => (src ? `/api/images/proxy?src=${encodeURIComponent(src)}` : undefined);

interface DriverSelectProps {
  drivers: Driver[];
  value: string;
  onChange: (driverId: string) => void;
  label: string;
  id: string;
  disabled?: boolean;
  disabledReasons?: Record<string, string>; // driverId -> reason text
  showTeamLogo?: boolean;
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
  disabledReasons = {},
  showTeamLogo = true,
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
        // discourage password managers from overlaying icons
        instanceId={`${id}-drivers`}
        name={`${id}-drivers`}
        autoComplete="off"
        value={selectedOption}
        onChange={(option: SingleValue<DriverOption>) => {
          if (option) onChange(option.value);
        }}
        options={groupedOptions}
        isDisabled={disabled}
        isOptionDisabled={(option) => !!disabledReasons[option.value]}
        isSearchable
        placeholder="Select a driver"
        formatOptionLabel={({ driver }, { context }) => {
          const reason = disabledReasons[driver.id];
          const logoSrc = showTeamLogo && driver.constructorName ? teamLogos[driver.constructorName] : undefined;
          // Only show the disabled reason in the dropdown menu, not in the selected value
          const showReason = context === 'menu' && !!reason;

          const avatar = driver.profilePictureUrl ? (
            <img
              src={proxy(driver.profilePictureUrl)}
              alt={`${driver.firstName} ${driver.lastName}`}
              className="w-8 h-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
              {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
            </div>
          );

          if (context === 'value') {
            // Selected value rendering (compact, no reason)
            return (
              <div className="flex items-center gap-2">
                {avatar}
                <span>{driver.firstName} {driver.lastName}</span>
              </div>
            );
          }

          // Dropdown option rendering (include reason and optional team logo)
          return (
            <div className="flex items-center gap-2 w-full">
              {avatar}
              <span className={showReason ? 'text-gray-500' : ''}>{driver.firstName} {driver.lastName}</span>
              {showReason && (
                <span
                  className="ml-auto text-[10px] leading-none px-2 py-1 rounded-full border font-semibold"
                  style={{
                    backgroundColor: '#fef3c7', // amber-100
                    color: '#92400e',          // amber-700
                    borderColor: '#fcd34d',    // amber-300
                  }}
                >
                  {reason}
                </span>
              )}
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt={driver.constructorName || 'Team'}
                  className="w-5 h-5 ml-2 opacity-80"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
            </div>
          );
        }}
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