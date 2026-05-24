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
export type AppView = 'calendar' | 'day-detail' | 'event-form' | 'event-detail' | 'alarms' | 'timers' | 'alarm-form' | 'timer-form';

export type CustomAlarmRepeat = 'once' | 'daily' | 'weekday';

export interface CustomAlarm {
  id: string;
  time: string; // HH:MM
  repeat: CustomAlarmRepeat;
  deleteOnRing: boolean; // only for repeat === 'once'
  isActive: boolean;
  label?: string;
  nextTriggerTime?: number;
}

export interface ConfiguredTimer {
  id: string;
  duration: number; // in seconds
  label?: string;
}

export interface ActiveTimer {
  id: string; // unique instance ID
  configuredTimerId: string;
  duration: number; // total duration in seconds
  remainingSeconds: number; // remaining seconds
  isRunning: boolean;
  label?: string;
  startTime?: number; // timestamp when started/resumed
  elapsedBefore: number; // seconds elapsed before last pause
}

