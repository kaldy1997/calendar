import type { CalendarEvent } from '../../types/types';
import { formatFullDate, isWeekend } from '../../utils/dateUtils';
import './DayDetail.scss';

interface DayDetailProps {
  date: Date;
  events: CalendarEvent[];
  onBack: () => void;
  onEventClick: (event: CalendarEvent) => void;
}

import { isEventCompletedOnDate } from '../../utils/eventUtils';
import { db } from '../../services/db';

export default function DayDetail({ date, events, onBack, onEventClick }: DayDetailProps) {
  const formattedDate = formatFullDate(date);

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleToggleComplete = async (event: CalendarEvent) => {
    await db.events.update(event.id, { isCompleted: !event.isCompleted });
  };

  return (
    <div className="day-detail" data-testid="day-detail">
      <header className="day-detail__header">
        <button className="day-detail__back-btn" onClick={onBack} aria-label="Volver al calendario">
          ‹
        </button>
        <h2 className={`day-detail__date ${isWeekend(date) ? 'day-detail__date--weekend' : ''}`}>
          {formattedDate}
        </h2>
      </header>

      <div className="day-detail__content">
        {sortedEvents.length > 0 ? (
          <div className="day-detail__event-list">
            {sortedEvents.map((event) => {
              const isDone = isEventCompletedOnDate(event);
              return (
                <div 
                  key={event.id} 
                  className={`day-detail__event-card ${isDone ? 'day-detail__event-card--completed' : ''}`} 
                  data-testid={`event-card-${event.id}`}
                  onClick={() => onEventClick(event)}
                >
                  <div className="day-detail__event-checkbox">
                    <input 
                      type="checkbox" 
                      checked={isDone} 
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(event);
                      }}
                      aria-label="Marcar como completado"
                    />
                  </div>
                  <div className="day-detail__event-time">
                    <span className="day-detail__time-start">{event.startTime}</span>
                    {event.endTime && <span className="day-detail__time-end">{event.endTime}</span>}
                  </div>
                  <div className="day-detail__event-info">
                    <div className="day-detail__event-indicator" style={{ backgroundColor: event.color }} />
                    <div className="day-detail__event-text">
                      <h3 className="day-detail__event-title">{event.title}</h3>
                      {event.description && <p className="day-detail__event-description">{event.description}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="day-detail__empty-state">
            <p>No hay eventos para este día.</p>
          </div>
        )}
      </div>
    </div>
  );
}
