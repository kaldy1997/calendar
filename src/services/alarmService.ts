import { LocalNotifications } from '@capacitor/local-notifications';
import type { CalendarEvent } from '../types/types';

class AlarmService {
  async requestPermissions() {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  }

  async scheduleAlarms(event: CalendarEvent) {
    if (!event.alarms || event.alarms.length === 0) return;

    const eventDate = new Date(event.date);
    const [hours, minutes] = event.startTime.split(':').map(Number);
    eventDate.setHours(hours, minutes, 0, 0);

    const notifications = event.alarms.map((alarmMinutes, index) => {
      let alarmDate = new Date(eventDate);
      
      // alarmMinutes is the number of minutes before the event starts
      alarmDate.setMinutes(alarmDate.getMinutes() - alarmMinutes);

      // Generate a numeric ID from event.id and index
      // event.id is a string (often random or timestamp)
      const numericId = Math.abs(this.hashCode(event.id + index));

      return {
        title: `Recordatorio: ${event.title}`,
        body: `El evento comienza a las ${event.startTime}`,
        id: numericId,
        schedule: { at: alarmDate, allowWhileIdle: true },
        sound: 'alarm.mp3', // This will work if we add the file to res/raw
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
    // We can't easily query by extra data, so we might need to cancel by range 
    // or keep track of IDs. For now, we'll use the deterministic ID logic.
    const idsToCancel = [0, 1, 2, 3, 4, 5].map(index => ({
      id: Math.abs(this.hashCode(eventId + index))
    }));
    
    await LocalNotifications.cancel({
      notifications: idsToCancel
    });
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
