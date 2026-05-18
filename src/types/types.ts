export type RepeatMode = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string YYYY-MM-DD
  startTime: string; // HH:MM
  endTime?: string; // HH:MM
  color: string; // Categoría/Color
  category: string;
  isCompleted?: boolean;
  groupId?: string; // To link individual instances of a recurring series
  repeat?: RepeatMode;
  alarms?: number[]; // Minutes before
  location?: string;
  useAlarmSound?: boolean;
}

export type ViewMode = 'year' | 'month' | 'week';
export type AppView = 'calendar' | 'day-detail' | 'event-form' | 'event-detail';
