import { useState, useCallback, useMemo } from 'react';
import { Calendar } from './components/Calendar';
import { DayDetail } from './components/DayDetail';
import { ViewSelector } from './components/ViewSelector';
import { Fab } from './components/Fab';
import { EventForm } from './components/EventForm';
import type { CalendarEvent, ViewMode, AppView } from './types/types';
import './App.scss';

// Richer sample events for demonstration
const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: '1', date: '2026-05-15', startTime: '09:15', endTime: '11:30', title: 'Daily Standup', description: 'Reunión rápida de equipo', color: '#7c5cfc' },
  { id: '2', date: '2026-05-15', startTime: '11:30', endTime: '12:30', title: 'Client Call', description: 'Discutir nuevos requisitos', color: '#4ade80' },
  { id: '3', date: '2026-05-15', startTime: '14:00', title: 'Lunch', color: '#fbbf24' },
  { id: '4', date: '2026-05-16', startTime: '10:00', title: 'Deep Work', description: 'Sin interrupciones', color: '#7c5cfc' },
  { id: '5', date: '2026-05-20', startTime: '10:00', title: 'Dentista', description: 'Limpieza anual', color: '#ff6b8a' },
  // Day with > 3 events to test overflow
  { id: '6', date: '2026-05-25', startTime: '08:00', title: 'Gym', color: '#4ade80' },
  { id: '7', date: '2026-05-25', startTime: '10:00', title: 'Meeting con diseño', color: '#7c5cfc' },
  { id: '8', date: '2026-05-25', startTime: '12:00', title: 'Revisión Sprint', color: '#7c5cfc' },
  { id: '9', date: '2026-05-25', startTime: '15:00', title: 'Coffee Break', color: '#fbbf24' },
];

function App() {
  const [view, setView] = useState<AppView>('calendar');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(SAMPLE_EVENTS);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setView('day-detail');
  }, []);

  const handleBackToCalendar = useCallback(() => {
    setView('calendar');
  }, []);

  const handleAddEvent = useCallback(() => {
    setView('event-form');
  }, []);

  const handleSaveEvent = useCallback((newEvent: Omit<CalendarEvent, 'id'>) => {
    const eventWithId: CalendarEvent = {
      ...newEvent,
      id: Math.random().toString(36).substr(2, 9),
    };
    setEvents(prev => [...prev, eventWithId]);
    setView('calendar');
  }, []);

  const eventsForSelectedDate = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
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
          />
        )}
        {view === 'day-detail' && (
          <DayDetail
            date={selectedDate}
            events={eventsForSelectedDate}
            onBack={handleBackToCalendar}
          />
        )}
        {view === 'event-form' && (
          <EventForm
            onSave={handleSaveEvent}
            onCancel={handleBackToCalendar}
            initialDate={selectedDate}
          />
        )}
      </main>

      <Fab onClick={handleAddEvent} />

      {view === 'calendar' && (
        <ViewSelector
          currentView={viewMode}
          onChange={setViewMode}
        />
      )}
    </div>
  );
}

export default App;
