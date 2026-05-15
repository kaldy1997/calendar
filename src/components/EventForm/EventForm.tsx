import { useState } from 'react';
import type { CalendarEvent, RepeatMode } from '../../types/types';
import './EventForm.scss';

interface EventFormProps {
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onCancel: () => void;
  initialDate?: Date;
}

const REPEAT_OPTIONS: { value: RepeatMode; label: string }[] = [
  { value: 'none', label: 'No se repite' },
  { value: 'daily', label: 'Diariamente' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'monthly', label: 'Mensualmente' },
  { value: 'yearly', label: 'Anualmente' },
];

const ALARM_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
];

export default function EventForm({ onSave, onCancel, initialDate }: EventFormProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(
    (initialDate || new Date()).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [repeat, setRepeat] = useState<RepeatMode>('none');
  const [alarms, setAlarms] = useState<number[]>([]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      date,
      startTime,
      endTime,
      repeat,
      alarms,
      description,
      color: '#7c5cfc', // Default color
    });
  };

  const toggleAlarm = (value: number) => {
    setAlarms(prev => 
      prev.includes(value) 
        ? prev.filter(a => a !== value) 
        : [...prev, value]
    );
  };

  return (
    <div className="event-form">
      <div className="event-form__header">
        <button className="event-form__cancel" onClick={onCancel} aria-label="Cancelar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <button 
          className="event-form__save" 
          onClick={handleSubmit}
          disabled={!title.trim()}
          aria-label="Guardar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>

      <form className="event-form__content" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="event-form__field">
          <input
            type="text"
            className="event-form__input-title"
            placeholder="Título del evento"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        {/* Date Selector */}
        <div className="event-form__field">
          <label className="event-form__label" htmlFor="event-date">Fecha</label>
          <input
            id="event-date"
            type="date"
            className="event-form__input"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* Times */}
        <div className="event-form__field event-form__field--row">
          <div className="event-form__subfield">
            <label className="event-form__label" htmlFor="event-start">Inicio</label>
            <input
              id="event-start"
              type="time"
              className="event-form__input"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            />
          </div>
          <div className="event-form__subfield">
            <label className="event-form__label" htmlFor="event-end">Fin</label>
            <input
              id="event-end"
              type="time"
              className="event-form__input"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Recurrence */}
        <div className="event-form__field">
          <label className="event-form__label" htmlFor="event-repeat">Repetir</label>
          <select 
            id="event-repeat"
            className="event-form__select"
            value={repeat}
            onChange={e => setRepeat(e.target.value as RepeatMode)}
          >
            {REPEAT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Alarms (Multi-select pills) */}
        <div className="event-form__field">
          <label className="event-form__label">Alarmas</label>
          <div className="event-form__alarms">
            {ALARM_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`event-form__alarm-pill ${alarms.includes(opt.value) ? 'event-form__alarm-pill--active' : ''}`}
                onClick={() => toggleAlarm(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="event-form__field">
          <label className="event-form__label" htmlFor="event-desc">Descripción</label>
          <textarea
            id="event-desc"
            className="event-form__textarea"
            placeholder="Añadir descripción..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
          />
        </div>
      </form>
    </div>
  );
}
