import React from 'react';
import Select from 'react-select';
import type { GroupBase, SingleValue, StylesConfig } from 'react-select';
import type { Driver } from '../../api/client';
const proxy = (src?: string | null) => (src ? `/api/images/proxy?src=${encodeURIComponent(src)}` : undefined);

interface DriverSelectProps {
  drivers: Driver[];
  value: string;
  onChange: (driverId: string) => void;
  label: string;
  id: string;
  disabled?: boolean;
  disabledReasons?: Record<string, string>;
}

interface DriverOption {
  value: string;
  label: string;
  driver: Driver;
}

const darkStyles: StylesConfig<DriverOption, false, GroupBase<DriverOption>> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--f1-surface-elevated)',
    borderColor: state.isFocused ? 'var(--f1-red)' : 'var(--f1-border)',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(225, 6, 0, 0.2)' : 'none',
    color: 'var(--text-primary)',
    minHeight: '44px',
    '&:hover': {
      borderColor: 'var(--f1-red)',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--f1-surface-elevated)',
    border: '1px solid var(--f1-border)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'var(--f1-border)' : 'transparent',
    color: state.isDisabled ? 'var(--text-muted)' : 'var(--text-primary)',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    '&:active': {
      backgroundColor: 'var(--f1-border)',
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--text-primary)',
  }),
  input: (base) => ({
    ...base,
    color: 'var(--text-primary)',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--text-muted)',
  }),
  groupHeading: (base) => ({
    ...base,
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--f1-surface)',
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    padding: '6px 12px',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: 'var(--f1-border)',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'var(--text-muted)',
    '&:hover': {
      color: 'var(--text-primary)',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'var(--text-muted)',
    '&:hover': {
      color: 'var(--f1-red)',
    },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: 'var(--text-muted)',
  }),
};

const DriverSelect: React.FC<DriverSelectProps> = ({
  drivers,
  value,
  onChange,
  label,
  id,
  disabled = false,
  disabledReasons = {},
}) => {
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
      <label htmlFor={id} className="block text-white font-medium mb-2 uppercase tracking-f1 text-sm">
        {label}
      </label>
      <Select
        inputId={id}
        instanceId={`${id}-drivers`}
        name={`${id}-drivers`}
        value={selectedOption}
        onChange={(option: SingleValue<DriverOption>) => {
          if (option) onChange(option.value);
        }}
        options={groupedOptions}
        isDisabled={disabled}
        isOptionDisabled={(option) => !!disabledReasons[option.value]}
        isSearchable
        placeholder="Select a driver"
        styles={darkStyles}
        formatOptionLabel={({ driver }, { context }) => {
          const reason = disabledReasons[driver.id];
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
            <div className="w-8 h-8 rounded-full bg-f1-surface flex items-center justify-center text-sm font-medium text-slate-400">
              {driver.firstName.charAt(0)}{driver.lastName.charAt(0)}
            </div>
          );

          if (context === 'value') {
            return (
              <div className="flex items-center gap-2">
                {avatar}
                <span>{driver.firstName} {driver.lastName}</span>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2 w-full">
              {avatar}
              <span className={showReason ? 'text-slate-500' : ''}>{driver.firstName} {driver.lastName}</span>
              {showReason && (
                <span
                  className="ml-auto text-[10px] leading-none px-2 py-1 rounded-full border font-semibold"
                  style={{
                    backgroundColor: 'rgba(251, 191, 36, 0.15)',
                    color: '#fbbf24',
                    borderColor: 'rgba(251, 191, 36, 0.3)',
                  }}
                >
                  {reason}
                </span>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default DriverSelect;
