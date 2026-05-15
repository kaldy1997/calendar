export type RepeatMode = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string YYYY-MM-DD
  startTime: string; // HH:MM
  endTime?: string; // HH:MM
  color: string; // Categoría/Color
  repeat?: RepeatMode;
  alarms?: number[]; // Minutes before
}

export type ViewMode = 'year' | 'month' | 'week';
export type AppView = 'calendar' | 'day-detail' | 'event-form';
