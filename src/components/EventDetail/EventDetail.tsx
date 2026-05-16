import type { CalendarEvent } from '../../types/types';
import { formatFullDate } from '../../utils/dateUtils';
import { getCategoryById } from '../../constants/categories';
import './EventDetail.scss';

interface EventDetailProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

export default function EventDetail({ event, onClose, onEdit, onDelete }: EventDetailProps) {
  const category = getCategoryById(event.category);
  const eventDate = new Date(event.date + 'T00:00:00');

  return (
    <div className="event-detail-view" data-testid="event-detail">
      <header className="event-detail-view__header">
        <button className="event-detail-view__close" onClick={onClose} aria-label="Cerrar">
          ‹
        </button>
        <div className="event-detail-view__actions">
          <button 
            className="event-detail-view__btn event-detail-view__btn--edit" 
            onClick={() => onEdit(event)}
            aria-label="Editar evento"
          >
            Editar
          </button>
          <button 
            className="event-detail-view__btn event-detail-view__btn--delete" 
            onClick={() => onDelete(event)}
            aria-label="Eliminar evento"
          >
            Eliminar
          </button>
        </div>
      </header>

      <div className="event-detail-view__content">
        <div className="event-detail-view__category-pill" style={{ backgroundColor: category.color }}>
          {category.label}
        </div>

        <h1 className="event-detail-view__title">{event.title}</h1>

        <div className="event-detail-view__info-group">
          <div className="event-detail-view__info-item">
            <span className="event-detail-view__icon">📅</span>
            <span className="event-detail-view__text">{formatFullDate(eventDate)}</span>
          </div>
          <div className="event-detail-view__info-item">
            <span className="event-detail-view__icon">⏰</span>
            <span className="event-detail-view__text">
              {event.startTime}{event.endTime ? ` — ${event.endTime}` : ''}
            </span>
          </div>
          {event.repeat && event.repeat !== 'none' && (
            <div className="event-detail-view__info-item">
              <span className="event-detail-view__icon">🔄</span>
              <span className="event-detail-view__text">
                {event.repeat === 'daily' && 'Diariamente'}
                {event.repeat === 'weekly' && 'Semanalmente'}
                {event.repeat === 'monthly' && 'Mensualmente'}
                {event.repeat === 'yearly' && 'Anualmente'}
              </span>
            </div>
          )}
        </div>

        {event.description && (
          <div className="event-detail-view__description">
            <h3 className="event-detail-view__section-title">Descripción</h3>
            <p className="event-detail-view__description-text">{event.description}</p>
          </div>
        )}

        {event.alarms && event.alarms.length > 0 && (
          <div className="event-detail-view__alarms">
            <h3 className="event-detail-view__section-title">Alarmas</h3>
            <div className="event-detail-view__alarm-list">
              {event.alarms.map(alarm => (
                <span key={alarm} className="event-detail-view__alarm-tag">
                  {alarm < 60 ? `${alarm} min antes` : `${alarm/60} h antes`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
