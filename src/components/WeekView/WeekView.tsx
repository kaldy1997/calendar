import { useMemo, useRef, useEffect } from 'react';
import type { CalendarEvent } from '../../types/types';
import { 
  getStartOfWeek, 
  getWeekDays, 
  getDateString, 
  isSameDay, 
  isWeekend 
} from '../../utils/dateUtils';
import './WeekView.scss';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onNavigate: (delta: number) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const WEEKDAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

import { isEventOnDate, isEventCompletedOnDate } from '../../utils/eventUtils';

export default function WeekView({ currentDate, events, onDateSelect, onNavigate, onEventClick }: WeekViewProps) {
  const today = useMemo(() => new Date(), []);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;

  const startOfWeek = useMemo(() => getStartOfWeek(currentDate), [currentDate]);
  const weekDays = useMemo(() => getWeekDays(startOfWeek), [startOfWeek]);

  // Center scroll on current time or morning
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const scrollPosition = Math.max(0, (currentHour - 2) * 60); // 60px per hour
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      onNavigate(diff > 0 ? 7 : -7); // Navigate by week (7 days)
    }
    touchStartX.current = null;
  };

  const getEventStyle = (event: CalendarEvent) => {
    const [startH, startM] = event.startTime.split(':').map(Number);
    const [endH, endM] = (event.endTime || `${startH + 1}:${startM}`).split(':').map(Number);
    
    const top = (startH * 60) + startM;
    const duration = ((endH * 60) + endM) - top;
    const height = Math.max(duration, 20); // Min height 20px

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: event.color,
    };
  };

  return (
    <div 
      className="week-view"
      data-testid="week-view"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Week Header */}
      <div className="week-view__header">
        <div className="week-view__corner"></div>
        <div className="week-view__days-header">
          {weekDays.map((day, i) => (
            <div 
              key={i} 
              className={`week-view__day-col-header ${isSameDay(day, today) ? 'week-view__day-col-header--today' : ''}`}
              onClick={() => onDateSelect(day)}
            >
              <span className="week-view__day-name">{WEEKDAYS_SHORT[i]}</span>
              <span className={`week-view__day-number ${isWeekend(day) ? 'week-view__day-number--weekend' : ''}`}>
                {day.getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Week Grid */}
      <div className="week-view__body" ref={scrollContainerRef}>
        <div className="week-view__grid">
          {/* Hours Column */}
          <div className="week-view__hours">
            {HOURS.map(hour => (
              <div key={hour} className="week-view__hour-label">
                {hour}:00
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="week-view__days-grid">
            {/* Background Grid Lines */}
            {HOURS.map(hour => (
              <div key={hour} className="week-view__hour-row" />
            ))}

            {/* Event Columns */}
            <div className="week-view__columns">
              {weekDays.map((day, dayIdx) => {
                const dayEvents = events.filter(e => isEventOnDate(e, day));

                return (
                  <div key={dayIdx} className="week-view__day-column">
                    {dayEvents.map(event => {
                      const isDone = isEventCompletedOnDate(event);
                      return (
                        <div 
                          key={event.id} 
                          className={`week-view__event ${isDone ? 'week-view__event--completed' : ''}`}
                          style={getEventStyle(event)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                        >
                          <div className="week-view__event-title">{event.title}</div>
                          <div className="week-view__event-time">{event.startTime}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
