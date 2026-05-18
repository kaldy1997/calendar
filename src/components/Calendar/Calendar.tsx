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

  // Flag to skip the next viewMode reset (used when navigating from YearView)
  const skipResetRef = useRef(false);
  const year = currentDate.getFullYear();

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

  // --- Swiper Drag / Swipe Gestures Implementation ---
  const [dragOffset, setDragOffset] = useState(0);
  const [transitionTarget, setTransitionTarget] = useState<'prev' | 'next' | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeLocked = useRef<boolean>(false);

  const prevDate = useMemo(() => {
    if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(currentDate.getDate() - 7);
      return d;
    } else if (viewMode === 'year') {
      return new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
    } else {
      return new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    }
  }, [currentDate, viewMode]);

  const nextDate = useMemo(() => {
    if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(currentDate.getDate() + 7);
      return d;
    } else if (viewMode === 'year') {
      return new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1);
    } else {
      return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
  }, [currentDate, viewMode]);

  const handleNavigate = useCallback(
    (delta: number) => {
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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (transitionTarget !== null) return; // Prevent swipe during active transitions
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipeLocked.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = touchX - touchStartX.current;
    const diffY = touchY - touchStartY.current;

    // Lock direction
    if (!swipeLocked.current) {
      if (Math.abs(diffY) > Math.abs(diffX)) {
        touchStartX.current = null;
        touchStartY.current = null;
        return;
      }
      swipeLocked.current = true;
    }

    if (e.cancelable) {
      e.preventDefault();
    }
    setDragOffset(diffX);
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) {
      setDragOffset(0);
      return;
    }

    const threshold = 70;
    if (dragOffset > threshold) {
      // Swipe Right -> Smooth transition to Previous Pane (0%)
      setTransitionTarget('prev');

      setTimeout(() => {
        if (viewMode === 'week') {
          handleNavigate(-7);
        } else if (viewMode === 'year') {
          handleNavigate(-12);
        } else {
          handleNavigate(-1);
        }
        setTransitionTarget(null);
        setDragOffset(0);
      }, 300);
    } else if (dragOffset < -threshold) {
      // Swipe Left -> Smooth transition to Next Pane (-200%)
      setTransitionTarget('next');

      setTimeout(() => {
        if (viewMode === 'week') {
          handleNavigate(7);
        } else if (viewMode === 'year') {
          handleNavigate(12);
        } else {
          handleNavigate(1);
        }
        setTransitionTarget(null);
        setDragOffset(0);
      }, 300);
    } else {
      // Not enough drag -> Smooth snap back to middle pane (-100%)
      setDragOffset(0);
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const goToToday = useCallback(() => {
    const now = new Date();
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
        <div
          className="calendar__slider-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="calendar__slider"
            style={{
              transform: transitionTarget === 'prev'
                ? 'translate3d(0, 0, 0)'
                : transitionTarget === 'next'
                  ? 'translate3d(-200%, 0, 0)'
                  : `translate3d(calc(-100% + ${dragOffset}px), 0, 0)`,
            }}
          >
            {/* Previous Pane */}
            <div className="calendar__pane">
              {viewMode === 'month' && (
                <MonthView
                  currentDate={prevDate}
                  events={events}
                  onDateSelect={handleDateSelect}
                  direction={null}
                />
              )}
              {viewMode === 'week' && (
                <WeekView
                  currentDate={prevDate}
                  events={events}
                  onDateSelect={handleDateSelect}
                  onEventClick={onEventClick}
                  direction={null}
                />
              )}
              {viewMode === 'year' && (
                <YearView
                  currentDate={prevDate}
                  onMonthSelect={handleMonthSelect}
                  direction={null}
                />
              )}
            </div>

            {/* Current Pane */}
            <div className="calendar__pane">
              {viewMode === 'month' && (
                <MonthView
                  currentDate={currentDate}
                  events={events}
                  onDateSelect={handleDateSelect}
                  direction={null}
                />
              )}
              {viewMode === 'week' && (
                <WeekView
                  currentDate={currentDate}
                  events={events}
                  onDateSelect={handleDateSelect}
                  onEventClick={onEventClick}
                  direction={null}
                />
              )}
              {viewMode === 'year' && (
                <YearView
                  currentDate={currentDate}
                  onMonthSelect={handleMonthSelect}
                  direction={null}
                />
              )}
            </div>

            {/* Next Pane */}
            <div className="calendar__pane">
              {viewMode === 'month' && (
                <MonthView
                  currentDate={nextDate}
                  events={events}
                  onDateSelect={handleDateSelect}
                  direction={null}
                />
              )}
              {viewMode === 'week' && (
                <WeekView
                  currentDate={nextDate}
                  events={events}
                  onDateSelect={handleDateSelect}
                  onEventClick={onEventClick}
                  direction={null}
                />
              )}
              {viewMode === 'year' && (
                <YearView
                  currentDate={nextDate}
                  onMonthSelect={handleMonthSelect}
                  direction={null}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
