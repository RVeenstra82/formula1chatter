import { format, formatDistance, parseISO, addMinutes } from 'date-fns';
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
  const [hours, minutes] = timeString.split(':').map(Number);
  const time = addMinutes(addMinutes(baseDate, hours * 60), minutes);
  
  return format(time, formatString, { 
    locale: locale === 'nl' ? nl : enUS 
  });
};

/**
 * Format a time string to show only hours and minutes (remove seconds)
 */
export const formatTimeWithoutSeconds = (timeString: string | null | undefined): string => {
  if (!timeString) return '';
  
  // Split by colon and take only hours and minutes
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  
  return timeString;
};

/**
 * Calculate the time remaining until a given date and time
 * Note: Backend stores race times as UTC times without timezone info (LocalTime)
 * We need to treat them as UTC times for correct calculation
 */
export const calculateTimeRemaining = (
  dateString: string, 
  timeString: string | null,
  locale: Language
): string => {
  // Parse the date in UTC to avoid timezone issues
  const date = parseISO(dateString + 'T00:00:00Z');
  
  // Set the time if provided, otherwise use noon UTC
  if (timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setUTCHours(hours, minutes, 0, 0);
  } else {
    date.setUTCHours(12, 0, 0, 0);
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

/**
 * Check if the race starts in less than one hour
 * Note: Backend stores race times as UTC times without timezone info
 */
export const isLessThanOneHour = (
  dateString: string, 
  timeString: string | null
): boolean => {
  const date = parseISO(dateString + 'T00:00:00Z');
  
  if (timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setUTCHours(hours, minutes, 0, 0);
  } else {
    date.setUTCHours(12, 0, 0, 0);
  }
  
  const now = new Date();
  const diffInMinutes = (date.getTime() - now.getTime()) / (1000 * 60);
  
  return diffInMinutes <= 60 && diffInMinutes > 0;
};

/**
 * Check if the race starts in less than five minutes (or has already started).
 * Matches backend `isPredictionsClosed` logic: minutesUntilRace < 5
 * Note: Backend stores race times as UTC times without timezone info
 */
export const isLessThanFiveMinutes = (
  dateString: string,
  timeString: string | null
): boolean => {
  const date = parseISO(dateString + 'T00:00:00Z');

  if (timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setUTCHours(hours, minutes, 0, 0);
  } else {
    date.setUTCHours(12, 0, 0, 0);
  }

  const now = new Date();
  const diffInMinutes = (date.getTime() - now.getTime()) / (1000 * 60);

  return diffInMinutes < 5;
}; 

/**
 * Build a Date object representing the race start (date + time, or noon if time unknown)
 * Note: Backend stores race times as UTC times without timezone info
 */
export const getRaceStartDate = (
  dateString: string,
  timeString: string | null
): Date => {
  const date = parseISO(dateString + 'T00:00:00Z');
  if (timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setUTCHours(hours, minutes, 0, 0);
  } else {
    // Fallback to midday UTC if no explicit time is provided
    date.setUTCHours(12, 0, 0, 0);
  }
  return date;
};

/**
 * Determine if the race has started using date + time
 */
export const hasRaceStarted = (
  dateString: string,
  timeString: string | null
): boolean => {
  const start = getRaceStartDate(dateString, timeString);
  const now = new Date();
  return now >= start;
};