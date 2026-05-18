import { LocalNotifications } from '@capacitor/local-notifications';
import type { CalendarEvent } from '../types/types';

class AlarmService {
  async requestPermissions() {
    try {
      const { display } = await LocalNotifications.requestPermissions();
      if (display === 'granted') {
        try {
          // Create custom Android notification channels
          await LocalNotifications.createChannel({
            id: 'loud-alarm-channel',
            name: 'Alarmas de Eventos (Sonido Fuerte)',
            description: 'Alarmas que suenan con sonido de alarma al comenzar el evento',
            importance: 5, // MAX importance (heads-up / banner + sound)
            sound: 'alarm.mp3', // Plays res/raw/alarm.mp3
            visibility: 1, // Public
            vibration: true
          });

          await LocalNotifications.createChannel({
            id: 'reminders-channel',
            name: 'Recordatorios (Estándar)',
            description: 'Recordatorios con sonido de notificación estándar antes del evento',
            importance: 3, // Standard importance
            visibility: 1,
            vibration: true
          });
        } catch (err) {
          console.error('Error al crear canales de notificaciones:', err);
        }
        return true;
      }
    } catch (e) {
      console.warn('LocalNotifications are not available in this environment:', e);
    }
    return false;
  }

  async scheduleAlarms(event: CalendarEvent) {
    const alarmsList = [...(event.alarms || [])];

    // If loud alarm is enabled, ensure we schedule a 0 minute alarm (at the exact start time)
    if (event.useAlarmSound && !alarmsList.includes(0)) {
      alarmsList.push(0);
    }

    if (alarmsList.length === 0) return;

    const eventDate = new Date(event.date);
    const [hours, minutes] = event.startTime.split(':').map(Number);
    eventDate.setHours(hours, minutes, 0, 0);

    const notifications = alarmsList.map((alarmMinutes, index) => {
      let alarmDate = new Date(eventDate);
      alarmDate.setMinutes(alarmDate.getMinutes() - alarmMinutes);

      const numericId = Math.abs(this.hashCode(event.id + index));
      const isLoudAlarm = (alarmMinutes === 0 && event.useAlarmSound);

      let bodyText = `El evento comienza a las ${event.startTime}`;
      if (isLoudAlarm) {
        bodyText = `¡Es hora! El evento ha comenzado: ${event.startTime}`;
      } else if (alarmMinutes > 0) {
        bodyText = alarmMinutes >= 60 
          ? `El evento comienza en ${Math.round(alarmMinutes / 60)} hora(s) (a las ${event.startTime})`
          : `El evento comienza en ${alarmMinutes} minutos (a las ${event.startTime})`;
      }

      return {
        title: isLoudAlarm ? `🚨 ALARMA: ${event.title}` : `Recordatorio: ${event.title}`,
        body: bodyText,
        id: numericId,
        schedule: { at: alarmDate, allowWhileIdle: true },
        sound: isLoudAlarm ? 'alarm.mp3' : undefined,
        channelId: isLoudAlarm ? 'loud-alarm-channel' : 'reminders-channel',
        attachments: [],
        extra: { eventId: event.id }
      };
    }).filter(n => n.schedule.at > new Date()); // Only future alarms

    if (notifications.length > 0) {
      await LocalNotifications.schedule({
        notifications: notifications as any
      });
    }
  }

  async cancelAlarms(eventId: string) {
    // Cancel up to 10 possible scheduled alarms for this event ID
    const idsToCancel = Array.from({ length: 10 }, (_, index) => ({
      id: Math.abs(this.hashCode(eventId + index))
    }));
    
    await LocalNotifications.cancel({
      notifications: idsToCancel
    });
  }

  async cancelAllAlarms() {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending && pending.notifications && pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map(n => ({ id: n.id }))
        });
      }
    } catch (e) {
      console.warn('Could not cancel all pending alarms:', e);
    }
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}

export const alarmService = new AlarmService();
