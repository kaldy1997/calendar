import type { CalendarEvent } from '../types/types';
import { getDateString } from './dateUtils';

/**
 * Checks if a given event occurs on a specific date.
 * (Now simplified as we unroll recurrences into individual events)
 */
export const isEventOnDate = (event: CalendarEvent, date: Date): boolean => {
  return event.date === getDateString(date);
};

/**
 * Checks if an event is marked as completed.
 */
export const isEventCompletedOnDate = (event: CalendarEvent): boolean => {
  return !!event.isCompleted;
};

/**
 * Given a list of events and a target date, returns all events (including recurrences) for that date.
 */
export const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => isEventOnDate(event, date));
};

/**
 * Given a list of events and a list of dates, returns a map of date strings to arrays of events.
 */
export const getEventsByDateMap = (events: CalendarEvent[], dates: Date[]): Map<string, CalendarEvent[]> => {
  const map = new Map<string, CalendarEvent[]>();
  
  dates.forEach(date => {
    const dateStr = getDateString(date);
    const dayEvents = getEventsForDate(events, date);
    if (dayEvents.length > 0) {
      map.set(dateStr, dayEvents);
    }
  });

  return map;
};
