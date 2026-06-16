import { LocalNotifications } from '@capacitor/local-notifications';
import type { ConfiguredTimer, ActiveTimer } from '../types/types';

const TIMER_NOTIFICATION_ID = 99999;
const TIMERS_CHANNEL_ID = 'timers-channel';
const LOUD_ALARM_CHANNEL_ID = 'loud-alarm-channel';

class TimerService {
  private activeTimers: ActiveTimer[] = [];
  private listeners: ((timers: ActiveTimer[]) => void)[] = [];
  private intervalId: any = null;
  private isInitialized = false;

  constructor() {
    // We defer actual initialization until init() is called by App.tsx
  }

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Load from localStorage
    try {
      const saved = localStorage.getItem('active_timers');
      if (saved) {
        const parsed = JSON.parse(saved) as ActiveTimer[];
        // Re-calculate remaining seconds for running timers based on wall clock
        this.activeTimers = parsed.map(t => {
          if (t.isRunning && t.startTime) {
            const elapsed = Math.floor((Date.now() - t.startTime) / 1000);
            const currentElapsed = t.elapsedBefore + elapsed;
            const remaining = Math.max(0, t.duration - currentElapsed);
            return {
              ...t,
              remainingSeconds: remaining,
              isRunning: remaining > 0 ? t.isRunning : false
            };
          }
          return t;
        });
      }
    } catch (e) {
      console.error('Error loading active timers:', e);
    }

    // 2. Register local notification actions and channels
    try {
      await LocalNotifications.createChannel({
        id: TIMERS_CHANNEL_ID,
        name: 'Temporizadores Activos',
        description: 'Progreso de los temporizadores activos en la barra de notificaciones',
        importance: 2, // Low importance: shows in drawer, silent, no heads-up
        visibility: 1,
        vibration: false
      });

      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'TIMER_ACTIONS',
            actions: [
              {
                id: 'pause',
                title: 'Pausar',
                foreground: false
              },
              {
                id: 'cancel',
                title: 'Cancelar',
                foreground: false
              }
            ]
          }
        ]
      });

      // Listen for actions
      await LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        const notificationId = notificationAction.notification.id;
        if (notificationId === TIMER_NOTIFICATION_ID) {
          const actionId = notificationAction.actionId;
          if (actionId === 'pause') {
            this.pauseActiveNotificationTimer();
          } else if (actionId === 'cancel') {
            this.cancelActiveNotificationTimer();
          }
        }
      });
    } catch (e) {
      console.warn('LocalNotifications features not fully supported in this environment:', e);
    }

    // 3. Start interval if there are timers running
    this.checkInterval();
    this.notify();
  }

  getActiveTimers(): ActiveTimer[] {
    return this.activeTimers;
  }

  startTimer(preset: ConfiguredTimer) {
    const newActive: ActiveTimer = {
      id: Math.random().toString(36).substring(2, 11),
      configuredTimerId: preset.id,
      duration: preset.duration,
      remainingSeconds: preset.duration,
      isRunning: true,
      startTime: Date.now(),
      elapsedBefore: 0,
      label: preset.label
    };
    this.activeTimers = [newActive, ...this.activeTimers];
    this.save();
    this.checkInterval();
    this.updateNotification();
    this.notify();
  }

  pauseTimer(id: string) {
    this.activeTimers = this.activeTimers.map(t => {
      if (t.id === id && t.isRunning && t.startTime) {
        const elapsed = Math.floor((Date.now() - t.startTime) / 1000);
        return {
          ...t,
          isRunning: false,
          elapsedBefore: t.elapsedBefore + elapsed,
          startTime: undefined
        };
      }
      return t;
    });
    this.save();
    this.checkInterval();
    this.updateNotification();
    this.notify();
  }

  resumeTimer(id: string) {
    this.activeTimers = this.activeTimers.map(t => {
      if (t.id === id && !t.isRunning) {
        return {
          ...t,
          isRunning: true,
          startTime: Date.now()
        };
      }
      return t;
    });
    this.save();
    this.checkInterval();
    this.updateNotification();
    this.notify();
  }

  cancelTimer(id: string) {
    this.activeTimers = this.activeTimers.filter(t => t.id !== id);
    this.save();
    this.checkInterval();
    this.updateNotification();
    this.notify();
  }

  subscribe(callback: (timers: ActiveTimer[]) => void) {
    this.listeners.push(callback);
    callback(this.activeTimers);
  }

  unsubscribe(callback: (timers: ActiveTimer[]) => void) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  private save() {
    try {
      localStorage.setItem('active_timers', JSON.stringify(this.activeTimers));
    } catch (e) {
      console.error('Error saving active timers:', e);
    }
  }

  private checkInterval() {
    const hasRunning = this.activeTimers.some(t => t.isRunning);
    if (hasRunning && !this.intervalId) {
      this.intervalId = setInterval(() => this.tick(), 1000);
    } else if (!hasRunning && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick() {
    let changed = false;
    this.activeTimers = this.activeTimers.map(t => {
      if (t.isRunning && t.startTime) {
        const elapsed = Math.floor((Date.now() - t.startTime) / 1000);
        const currentElapsed = t.elapsedBefore + elapsed;
        const remaining = Math.max(0, t.duration - currentElapsed);

        if (remaining !== t.remainingSeconds) {
          changed = true;
          
          if (remaining === 0) {
            // Timer finished!
            this.playLoudAlarm(t);
            return {
              ...t,
              remainingSeconds: 0,
              isRunning: false,
              startTime: undefined,
              elapsedBefore: t.duration
            };
          }

          return {
            ...t,
            remainingSeconds: remaining
          };
        }
      }
      return t;
    });

    if (changed) {
      this.save();
      this.checkInterval();
      this.updateNotification();
      this.notify();
    }
  }

  private async playLoudAlarm(timer: ActiveTimer) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.abs(this.hashCode(timer.id)),
            title: timer.label ? `⏰ Temporizador: ${timer.label}` : '⏰ Temporizador terminado',
            body: '¡El tiempo se ha agotado!',
            sound: 'alarm.mp3',
            channelId: LOUD_ALARM_CHANNEL_ID,
            allowWhileIdle: true,
            extra: { timerId: timer.id }
          }
        ]
      });
    } catch (e) {
      console.warn('Could not trigger loud alarm notification:', e);
    }
  }

  private async updateNotification() {
    const runningTimers = this.activeTimers.filter(t => t.isRunning && t.remainingSeconds > 0);
    if (runningTimers.length === 0) {
      try {
        await LocalNotifications.cancel({
          notifications: [{ id: TIMER_NOTIFICATION_ID }]
        });
      } catch (e) {}
      return;
    }

    // Shortest remaining time timer
    const minTimer = runningTimers.reduce(
      (min, t) => t.remainingSeconds < min.remainingSeconds ? t : min,
      runningTimers[0]
    );

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: TIMER_NOTIFICATION_ID,
            title: minTimer.label ? `Temporizador: ${minTimer.label}` : 'Temporizador activo',
            body: `Tiempo restante: ${this.formatDuration(minTimer.remainingSeconds)}`,
            ongoing: true, // Ongoing notification, cannot be swiped away on Android
            autoCancel: false,
            channelId: TIMERS_CHANNEL_ID,
            actionTypeId: 'TIMER_ACTIONS',
            allowWhileIdle: true
          }
        ]
      });
    } catch (e) {
      // Not supported or permission issue
    }
  }

  private pauseActiveNotificationTimer() {
    const runningTimers = this.activeTimers.filter(t => t.isRunning && t.remainingSeconds > 0);
    if (runningTimers.length === 0) return;
    const minTimer = runningTimers.reduce(
      (min, t) => t.remainingSeconds < min.remainingSeconds ? t : min,
      runningTimers[0]
    );
    this.pauseTimer(minTimer.id);
  }

  private cancelActiveNotificationTimer() {
    const runningTimers = this.activeTimers.filter(t => t.isRunning && t.remainingSeconds > 0);
    if (runningTimers.length === 0) return;
    const minTimer = runningTimers.reduce(
      (min, t) => t.remainingSeconds < min.remainingSeconds ? t : min,
      runningTimers[0]
    );
    this.cancelTimer(minTimer.id);
  }

  private notify() {
    this.listeners.forEach(l => l([...this.activeTimers]));
  }

  private formatDuration(totalSecs: number) {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    const pad = (n: number) => String(n).padStart(2, '0');

    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash;
  }
}

export const timerService = new TimerService();
