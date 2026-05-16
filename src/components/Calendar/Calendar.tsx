import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { CalendarEvent, ViewMode } from '../../types/types';
import { formatMonthYear } from '../../utils/dateUtils';
import { MonthView } from '../MonthView';
import { YearView } from '../YearView';
import { WeekView } from '../WeekView';
import { getStartOfWeek } from '../../utils/dateUtils';
import './Calendar.scss';

interface CalendarProps {
  viewMode?: ViewMode;
  events?: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onMonthChange?: (year: number, month: number) => void;
  onViewChange?: (view: ViewMode) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

function Calendar({ 
  viewMode = 'month', 
  events = [], 
  onDateSelect, 
  onMonthChange,
  onViewChange,
  onEventClick
}: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [animKey, setAnimKey] = useState(0);
  
  // Flag to skip the next viewMode reset (used when navigating from YearView)
  const skipResetRef = useRef(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Reset to today when view mode changes per user request
  // But skip it if we are navigating explicitly from YearView
  useEffect(() => {
    if (skipResetRef.current) {
      skipResetRef.current = false;
      return;
    }
    const now = new Date();
    if (viewMode === 'week') {
      setCurrentDate(getStartOfWeek(now));
    } else {
      setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    }
  }, [viewMode]);

  const handleNavigate = useCallback(
    (delta: number) => {
      setDirection(delta > 0 ? 'left' : 'right');
      setAnimKey(prev => prev + 1);
      setCurrentDate((prev) => {
        let next: Date;
        if (viewMode === 'week') {
          // In week mode, delta is in days
          next = new Date(prev);
          next.setDate(prev.getDate() + delta);
        } else {
          // In month/year mode, delta is in months
          next = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
        }
        onMonthChange?.(next.getFullYear(), next.getMonth());
        return next;
      });
    },
    [viewMode, onMonthChange]
  );

  const goToToday = useCallback(() => {
    const now = new Date();
    setDirection(null);
    setAnimKey(prev => prev + 1);
    if (viewMode === 'week') {
      setCurrentDate(getStartOfWeek(now));
    } else {
      setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    }
    onMonthChange?.(now.getFullYear(), now.getMonth());
  }, [viewMode, onMonthChange]);

  const handleDateSelect = useCallback((date: Date) => {
    onDateSelect?.(date);
  }, [onDateSelect]);

  const handleMonthSelect = useCallback((monthIndex: number) => {
    skipResetRef.current = true; // Avoid resetting to today
    setCurrentDate(new Date(year, monthIndex, 1));
    onMonthChange?.(year, monthIndex);
    onViewChange?.('month');
  }, [year, onMonthChange, onViewChange]);

  return (
    <div className="calendar" data-testid="calendar">
      {/* Navigation Header */}
      <div className="calendar__nav">
        <button
          className="calendar__month-year"
          onClick={goToToday}
          aria-label="Ir a hoy"
          data-testid="calendar-today-btn"
        >
          {viewMode === 'year' ? year : formatMonthYear(currentDate)}
        </button>
      </div>

      {/* View Container */}
      <div className="calendar__view-container">
        {viewMode === 'month' && (
          <MonthView
            key={`month-${animKey}`}
            currentDate={currentDate}
            events={events}
            onDateSelect={handleDateSelect}
            onNavigate={handleNavigate}
            direction={direction}
          />
        )}
        {viewMode === 'year' && (
          <YearView
            key={`year-${animKey}`}
            currentDate={currentDate}
            onMonthSelect={handleMonthSelect}
            onNavigate={handleNavigate}
            direction={direction}
          />
        )}
        {viewMode === 'week' && (
          <WeekView
            key={`week-${animKey}`}
            currentDate={currentDate}
            events={events}
            onDateSelect={handleDateSelect}
            onNavigate={handleNavigate}
            onEventClick={(event) => onEventClick?.(event)}
            direction={direction}
          />
        )}
      </div>
    </div>
  );
}

export default Calendar;
