import { format, formatRelative, formatDistance, parseISO, addMinutes } from 'date-fns';
import { nl, enUS } from 'date-fns/locale';
import type { Language } from '../contexts/LanguageContext';

/**
 * Format a date to display in the correct locale
 */
export const formatDateLocalized = (
  dateString: string, 
  formatString: string, 
  locale: Language
): string => {
  const date = parseISO(dateString);
  return format(date, formatString, { 
    locale: locale === 'nl' ? nl : enUS 
  });
};

/**
 * Format a time to display in the correct locale
 */
export const formatTimeLocalized = (
  timeString: string, 
  formatString: string, 
  locale: Language
): string => {
  // Use a base date and add the time
  const baseDate = new Date('2000-01-01');
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const time = addMinutes(addMinutes(baseDate, hours * 60), minutes);
  
  return format(time, formatString, { 
    locale: locale === 'nl' ? nl : enUS 
  });
};

/**
 * Calculate the time remaining until a given date and time
 */
export const calculateTimeRemaining = (
  dateString: string, 
  timeString: string | null,
  locale: Language
): string => {
  // Parse the date
  const date = parseISO(dateString);
  
  // Set the time if provided, otherwise use noon
  if (timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setHours(hours, minutes, 0);
  } else {
    date.setHours(12, 0, 0);
  }
  
  // Calculate the difference from now
  const now = new Date();
  
  // If the date is in the past, return empty string
  if (date < now) {
    return '';
  }
  
  // Return the formatted distance
  return formatDistance(date, now, {
    locale: locale === 'nl' ? nl : enUS,
    addSuffix: false
  });
}; 