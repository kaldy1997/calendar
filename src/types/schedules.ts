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
