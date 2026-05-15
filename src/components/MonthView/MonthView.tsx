import { useMemo, useCallback, useRef } from 'react';
import type { CalendarEvent } from '../../types/types';
import { 
  getDaysInMonth, 
  getFirstDayOfMonth, 
  getDateString,
  isSameDay,
  isWeekend
} from '../../utils/dateUtils';
import './MonthView.scss';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onNavigate: (delta: number) => void;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function MonthView({ currentDate, events, onDateSelect, onNavigate }: MonthViewProps) {
  const today = useMemo(() => new Date(), []);
  const touchStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const totalDaysSoFar = days.length;
    const remainingInWeek = (7 - (totalDaysSoFar % 7)) % 7;
    
    for (let i = 1; i <= remainingInWeek; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const existing = map.get(event.date) || [];
      map.set(event.date, [...existing, event]);
    });
    return map;
  }, [events]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      onNavigate(diff > 0 ? 1 : -1);
    }
    touchStartX.current = null;
  };

  const getDayClassName = (date: Date, isCurrentMonth: boolean): string => {
    const classes = ['month-view__day'];
    if (isSameDay(date, today)) {
      classes.push('month-view__day--today');
    }
    if (isWeekend(date)) {
      classes.push('month-view__day--weekend');
    }
    return classes.join(' ');
  };

  return (
    <div 
      className="month-view" 
      data-testid="month-view"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="month-view__weekdays">
        {WEEKDAYS.map((day) => (
          <div key={day} className="month-view__weekday">{day}</div>
        ))}
      </div>

      <div className="month-view__days" data-testid="calendar-days">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          if (!isCurrentMonth) {
            return <div key={index} className="month-view__day--empty" aria-hidden="true" />;
          }

          const dateStr = getDateString(date);
          const dayEvents = eventsByDate.get(dateStr) || [];
          const displayEvents = dayEvents.slice(0, 3);
          const extraEventsCount = Math.max(0, dayEvents.length - 3);

          return (
            <button
              key={index}
              className={getDayClassName(date, isCurrentMonth)}
              onClick={() => onDateSelect(date)}
              aria-label={date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              data-testid={`calendar-day-${date.getDate()}`}
            >
              <div className="month-view__day-number">{date.getDate()}</div>
              <div className="month-view__day-events">
                {displayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="month-view__event-tag"
                    style={{ backgroundColor: event.color }}
                  >
                    {event.title}
                  </div>
                ))}
                {extraEventsCount > 0 && (
                  <div className="month-view__event-more">+{extraEventsCount}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
