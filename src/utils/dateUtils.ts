/**
 * Checks if two dates are the same day (ignoring time).
 */
export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Formats a date to "month year" (e.g., "mayo de 2026").
 */
export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
};

/**
 * Gets the number of days in a given month of a year.
 */
export const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

/**
 * Gets the starting day index of a month (0 = Monday, 6 = Sunday).
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday-based
};

/**
 * Returns a date string in YYYY-MM-DD format.
 */
export const getDateString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Formats a date to a full readable string for the UI.
 */
export const formatFullDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
/**
 * Checks if a date falls on a weekend (Saturday or Sunday).
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

/**
 * Gets the start of the week for a given date (Monday).
 */
export const getStartOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  const start = new Date(date);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Gets an array of 7 dates representing the week starting from the given date.
 */
export const getWeekDays = (startDate: Date): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
};
