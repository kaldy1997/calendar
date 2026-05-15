import type { CalendarEvent } from '../../types/types';
import { formatFullDate, isWeekend } from '../../utils/dateUtils';
import './DayDetail.scss';

interface DayDetailProps {
  date: Date;
  events: CalendarEvent[];
  onBack: () => void;
}

export default function DayDetail({ date, events, onBack }: DayDetailProps) {
  const formattedDate = formatFullDate(date);

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));

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
            {sortedEvents.map((event) => (
              <div key={event.id} className="day-detail__event-card" data-testid={`event-card-${event.id}`}>
                <div className="day-detail__event-time">
                  <span className="day-detail__time-start">{event.startTime}</span>
                  {event.endTime && <span className="day-detail__time-end">{event.endTime}</span>}
                </div>
                <div className="day-detail__event-info">
                  <div className="day-detail__event-indicator" style={{ backgroundColor: event.color }} />
                  <h3 className="day-detail__event-title">{event.title}</h3>
                </div>
              </div>
            ))}
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
