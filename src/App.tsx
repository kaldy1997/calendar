import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './services/db';
import { Calendar } from './components/Calendar';
import { DayDetail } from './components/DayDetail';
import { ViewSelector } from './components/ViewSelector';
import { Fab } from './components/Fab';
import { EventForm } from './components/EventForm';
import { EventDetail } from './components/EventDetail';
import { RecurrenceDialog } from './components/RecurrenceDialog';
import { alarmService } from './services/alarmService';
import { App as CapacitorApp } from '@capacitor/app';
import type { CalendarEvent, ViewMode, AppView } from './types/types';
import './App.scss';

// Richer sample events for demonstration
const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: '1', date: '2026-05-15', startTime: '09:15', endTime: '11:30', title: 'Daily Standup', description: 'Reunión rápida de equipo', color: '#7c5cfc', category: 'routines' },
  { id: '2', date: '2026-05-15', startTime: '11:30', endTime: '12:30', title: 'Client Call', description: 'Discutir nuevos requisitos', color: '#4ade80', category: 'work' },
  { id: '3', date: '2026-05-15', startTime: '14:00', title: 'Lunch', color: '#fbbf24', category: 'leisure' },
  { id: '4', date: '2026-05-16', startTime: '10:00', title: 'Deep Work', description: 'Sin interrupciones', color: '#7c5cfc', category: 'work' },
  { id: '5', date: '2026-05-20', startTime: '10:00', title: 'Dentista', description: 'Limpieza anual', color: '#ff6b8a', category: 'health' },
  { id: '6', date: '2026-05-25', startTime: '08:00', title: 'Gym', color: '#4ade80', category: 'sports' },
  { id: '7', date: '2026-05-25', startTime: '10:00', title: 'Meeting con diseño', color: '#7c5cfc', category: 'work' },
  { id: '8', date: '2026-05-25', startTime: '12:00', title: 'Revisión Sprint', color: '#7c5cfc', category: 'work' },
  { id: '9', date: '2026-05-25', startTime: '15:00', title: 'Coffee Break', color: '#fbbf24', category: 'leisure' },
];

import { getEventsForDate } from './utils/eventUtils';

function App() {
  const [view, setView] = useState<AppView>('calendar');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [recurrenceAction, setRecurrenceAction] = useState<{ 
    type: 'edit' | 'delete', 
    event: CalendarEvent,
    data?: any 
  } | null>(null);

  // Dexie Live Query
  const events = useLiveQuery(() => db.events.toArray()) || [];

  // Seed DB and Request Permissions
  useEffect(() => {
    const initApp = async () => {
      // Seed
      const count = await db.events.count();
      if (count === 0) {
        await db.events.bulkAdd(SAMPLE_EVENTS);
      }
      // Permissions
      await alarmService.requestPermissions();
    };
    initApp();
  }, []);

  // Hardware Back Button Navigation Handler
  useEffect(() => {
    const backHandler = CapacitorApp.addListener('backButton', () => {
      if (view === 'event-form') {
        if (selectedEvent) {
          setView('event-detail');
        } else {
          setView('calendar');
          setSelectedEvent(null);
        }
      } else if (view === 'event-detail') {
        setView('day-detail');
      } else if (view === 'day-detail') {
        setView('calendar');
        setSelectedEvent(null);
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      backHandler.then((handler: any) => handler.remove());
    };
  }, [view, selectedEvent]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setView('day-detail');
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setView('event-detail');
  }, []);

  const handleBackToCalendar = useCallback(() => {
    setView('calendar');
    setSelectedEvent(null);
  }, []);

  const handleAddEvent = useCallback(() => {
    setSelectedEvent(null);
    setView('event-form');
  }, []);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setView('event-form');
  }, []);

  const handleDeleteEvent = useCallback(async (event: CalendarEvent) => {
    if (event.groupId) {
      setRecurrenceAction({ type: 'delete', event });
    } else {
      await alarmService.cancelAlarms(event.id);
      await db.events.delete(event.id);
      handleBackToCalendar();
    }
  }, [handleBackToCalendar]);

  const handleSaveEvent = useCallback(async (eventData: any) => {
    if (Array.isArray(eventData)) {
      // New series
      const eventsWithIds = eventData.map(e => ({
        ...e,
        id: Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 5),
      }));
      await db.events.bulkAdd(eventsWithIds);
      // Schedule alarms for all events in series
      for (const e of eventsWithIds) {
        await alarmService.scheduleAlarms(e);
      }
      handleBackToCalendar();
    } else if (eventData.id) {
      // Editing
      const event = events.find(e => e.id === eventData.id);
      if (event?.groupId) {
        setRecurrenceAction({ type: 'edit', event, data: eventData });
      } else {
        await alarmService.cancelAlarms(eventData.id);
        await db.events.put(eventData);
        await alarmService.scheduleAlarms(eventData);
        handleBackToCalendar();
      }
    } else {
      // New single event
      const eventWithId: CalendarEvent = {
        ...eventData,
        id: Math.random().toString(36).substring(2, 11),
      };
      await db.events.add(eventWithId);
      await alarmService.scheduleAlarms(eventWithId);
      handleBackToCalendar();
    }
  }, [events, handleBackToCalendar]);

  const handleRecurrenceConfirm = useCallback(async (option: 'single' | 'future' | 'all') => {
    if (!recurrenceAction) return;

    const { type, event, data } = recurrenceAction;
    const groupId = event.groupId;

    if (type === 'delete') {
      if (option === 'single') {
        await alarmService.cancelAlarms(event.id);
        await db.events.delete(event.id);
      } else if (option === 'future') {
        const toDelete = events.filter(e => e.groupId === groupId && e.date >= event.date);
        for (const e of toDelete) await alarmService.cancelAlarms(e.id);
        await db.events.bulkDelete(toDelete.map(e => e.id));
      } else if (option === 'all') {
        const toDelete = events.filter(e => e.groupId === groupId);
        for (const e of toDelete) await alarmService.cancelAlarms(e.id);
        await db.events.bulkDelete(toDelete.map(e => e.id));
      }
    } else if (type === 'edit') {
      if (option === 'single') {
        await alarmService.cancelAlarms(data.id);
        await db.events.put(data);
        await alarmService.scheduleAlarms(data);
      } else if (option === 'future') {
        const toUpdate = events.filter(e => e.groupId === groupId && e.date >= event.date);
        for (const e of toUpdate) {
          const updated = { ...e, ...data, id: e.id, date: e.date };
          await alarmService.cancelAlarms(e.id);
          await db.events.put(updated);
          await alarmService.scheduleAlarms(updated);
        }
      } else if (option === 'all') {
        const toUpdate = events.filter(e => e.groupId === groupId);
        for (const e of toUpdate) {
          const updated = { ...e, ...data, id: e.id, date: e.date };
          await alarmService.cancelAlarms(e.id);
          await db.events.put(updated);
          await alarmService.scheduleAlarms(updated);
        }
      }
    }

    setRecurrenceAction(null);
    handleBackToCalendar();
  }, [recurrenceAction, events, handleBackToCalendar]);

  const eventsForSelectedDate = useMemo(() => {
    return getEventsForDate(events, selectedDate);
  }, [events, selectedDate]);

  return (
    <div className="app">
      <main className="app__content">
        {view === 'calendar' && (
          <Calendar
            viewMode={viewMode}
            events={events}
            onDateSelect={handleDateSelect}
            onViewChange={setViewMode}
            onEventClick={handleEventClick}
          />
        )}
        {view === 'day-detail' && (
          <DayDetail
            date={selectedDate}
            events={eventsForSelectedDate}
            onBack={handleBackToCalendar}
            onEventClick={handleEventClick}
          />
        )}
        {view === 'event-form' && (
          <EventForm
            onSave={handleSaveEvent}
            onCancel={selectedEvent ? () => setView('event-detail') : handleBackToCalendar}
            initialDate={selectedDate}
            initialEvent={selectedEvent || undefined}
          />
        )}
        {view === 'event-detail' && selectedEvent && (
          <EventDetail
            event={selectedEvent}
            onClose={handleBackToCalendar}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </main>

      {view === 'calendar' && <Fab onClick={handleAddEvent} />}

      {view === 'calendar' && (
        <ViewSelector
          currentView={viewMode}
          onChange={setViewMode}
        />
      )}

      {recurrenceAction && (
        <RecurrenceDialog
          title={recurrenceAction.type === 'delete' ? 'Eliminar serie' : 'Editar serie'}
          onSelect={handleRecurrenceConfirm}
          onCancel={() => setRecurrenceAction(null)}
        />
      )}
    </div>
  );
}

export default App;
