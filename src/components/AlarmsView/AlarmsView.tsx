import { useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { alarmService } from '../../services/alarmService';
import { Fab } from '../Fab';
import type { CalendarEvent, CustomAlarm, CustomAlarmRepeat } from '../../types/types';
import './AlarmsView.scss';

interface AlarmsViewProps {
  events: CalendarEvent[];
  onAddAlarm: () => void;
  onEditAlarm: (alarm: CustomAlarm) => void;
}

const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function AlarmsView({ events, onAddAlarm, onEditAlarm }: AlarmsViewProps) {
  // Custom Alarms query
  const customAlarms = useLiveQuery(() => db.customAlarms.toArray()) || [];

  // 1. Cleanup expired "once" alarms on mount
  useEffect(() => {
    const cleanupAlarms = async () => {
      const allAlarms = await db.customAlarms.toArray();
      const now = Date.now();
      const toDelete: string[] = [];
      const toDeactivate: CustomAlarm[] = [];

      for (const alarm of allAlarms) {
        if (
          alarm.isActive &&
          alarm.repeat === 'once' &&
          alarm.nextTriggerTime &&
          alarm.nextTriggerTime < now
        ) {
          if (alarm.deleteOnRing) {
            toDelete.push(alarm.id);
          } else {
            toDeactivate.push({
              ...alarm,
              isActive: false,
              nextTriggerTime: undefined
            });
          }
        }
      }

      if (toDelete.length > 0) {
        await db.customAlarms.bulkDelete(toDelete);
        for (const id of toDelete) {
          await alarmService.cancelCustomAlarm(id);
        }
      }

      if (toDeactivate.length > 0) {
        for (const alarm of toDeactivate) {
          await db.customAlarms.put(alarm);
          await alarmService.cancelCustomAlarm(alarm.id);
        }
      }
    };

    cleanupAlarms();
  }, []);

  // 2. Compute Today's Event Alarms (upper section)
  const todayEventAlarms = useMemo(() => {
    const todayStr = getTodayString();
    const todayEvents = events.filter(e => e.date === todayStr);
    const list: {
      id: string;
      title: string;
      alarmTime: string;
      offsetLabel: string;
      useAlarmSound: boolean;
    }[] = [];

    for (const event of todayEvents) {
      if (!event.alarms || event.alarms.length === 0) continue;

      const [h, m] = event.startTime.split(':').map(Number);
      const eventDate = new Date();
      eventDate.setHours(h, m, 0, 0);

      for (const alarmOffset of event.alarms) {
        const alarmDate = new Date(eventDate.getTime() - alarmOffset * 60 * 1000);
        const alarmTimeStr = `${String(alarmDate.getHours()).padStart(2, '0')}:${String(
          alarmDate.getMinutes()
        ).padStart(2, '0')}`;

        let offsetLabel = '';
        if (alarmOffset === 0) {
          offsetLabel = 'A la hora del evento';
        } else if (alarmOffset >= 60) {
          offsetLabel = `${Math.round(alarmOffset / 60)}h antes`;
        } else {
          offsetLabel = `${alarmOffset} min antes`;
        }

        list.push({
          id: `${event.id}_${alarmOffset}`,
          title: event.title,
          alarmTime: alarmTimeStr,
          offsetLabel,
          useAlarmSound: !!event.useAlarmSound
        });
      }
    }

    // Sort by alarmTime
    return list.sort((a, b) => a.alarmTime.localeCompare(b.alarmTime));
  }, [events]);

  const handleToggleAlarm = async (alarm: CustomAlarm) => {
    const updatedIsActive = !alarm.isActive;
    let nextTriggerTime: number | undefined = undefined;

    if (updatedIsActive && alarm.repeat === 'once') {
      const [hours, minutes] = alarm.time.split(':').map(Number);
      const now = new Date();
      const trigger = new Date();
      trigger.setHours(hours, minutes, 0, 0);
      if (trigger <= now) {
        trigger.setDate(trigger.getDate() + 1);
      }
      nextTriggerTime = trigger.getTime();
    }

    const updatedAlarm = {
      ...alarm,
      isActive: updatedIsActive,
      nextTriggerTime
    };

    await db.customAlarms.put(updatedAlarm);
    if (updatedIsActive) {
      await alarmService.scheduleCustomAlarm(updatedAlarm);
    } else {
      await alarmService.cancelCustomAlarm(alarm.id);
    }
  };

  const handleDeleteAlarm = async (id: string) => {
    await db.customAlarms.delete(id);
    await alarmService.cancelCustomAlarm(id);
  };

  const getRepeatLabel = (repeat: CustomAlarmRepeat) => {
    if (repeat === 'once') return 'Una vez';
    if (repeat === 'daily') return 'Diariamente';
    if (repeat === 'weekday') return 'De lunes a viernes';
    return '';
  };

  return (
    <div className="alarms-view" data-testid="alarms-view">
      <header className="alarms-view__header">
        <h1 className="alarms-view__title">Alarmas</h1>
      </header>

      <div className="alarms-view__content">
        
        {/* SECTION 1: TODAY'S EVENT ALARMS */}
        <section className="alarms-view__section">
          <h2 className="alarms-view__section-title">Alarmas del día de hoy</h2>
          {todayEventAlarms.length === 0 ? (
            <div className="alarms-view__empty">No hay alarmas para eventos de hoy</div>
          ) : (
            <div className="alarms-view__list">
              {todayEventAlarms.map((item) => (
                <div className="alarms-view__item alarms-view__item--event" key={item.id}>
                  <div className="alarms-view__time-wrapper">
                    <span className="alarms-view__time">{item.alarmTime}</span>
                    <span className="alarms-view__tag">Evento</span>
                  </div>
                  <div className="alarms-view__details">
                    <span className="alarms-view__item-title">{item.title}</span>
                    <span className="alarms-view__item-subtitle">
                      {item.offsetLabel} {item.useAlarmSound ? '🔔 Sonido fuerte' : '💬 Notificación'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: CONFIGURED USER ALARMS */}
        <section className="alarms-view__section">
          <h2 className="alarms-view__section-title">Alarmas configuradas</h2>
          {customAlarms.length === 0 ? (
            <div className="alarms-view__empty">No tienes alarmas configuradas</div>
          ) : (
            <div className="alarms-view__list">
              {customAlarms.map((alarm) => (
                <div 
                  className={`alarms-view__item ${!alarm.isActive ? 'alarms-view__item--inactive' : ''}`} 
                  key={alarm.id}
                  data-testid={`custom-alarm-item-${alarm.id}`}
                  onClick={() => onEditAlarm(alarm)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="alarms-view__time-wrapper">
                    <span className="alarms-view__time">{alarm.time}</span>
                    <span className="alarms-view__repeat-tag">{getRepeatLabel(alarm.repeat)}</span>
                  </div>

                  <div className="alarms-view__actions">
                    <label 
                      className="alarms-view__switch" 
                      aria-label="Activar/Desactivar alarma"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input 
                        type="checkbox" 
                        checked={alarm.isActive} 
                        onChange={() => handleToggleAlarm(alarm)}
                        data-testid={`custom-alarm-toggle-${alarm.id}`}
                      />
                      <span className="alarms-view__slider"></span>
                    </label>

                    <button 
                      className="alarms-view__delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAlarm(alarm.id);
                      }}
                      aria-label="Eliminar alarma"
                      data-testid={`custom-alarm-delete-${alarm.id}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* FLOATING ACTION BUTTON */}
      <Fab onClick={onAddAlarm} aria-label="Agregar alarma" />
    </div>
  );
}
