import { useState } from 'react';
import type { CalendarEvent, RepeatMode } from '../../types/types';
import './EventForm.scss';

interface EventFormProps {
  onSave: (event: (Omit<CalendarEvent, 'id'> & { id?: string }) | (Omit<CalendarEvent, 'id'> & { id?: string })[]) => void;
  onCancel: () => void;
  initialDate?: Date;
  initialEvent?: CalendarEvent;
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

import { CATEGORIES, getCategoryById } from '../../constants/categories';
import { getDateString } from '../../utils/dateUtils';

export default function EventForm({ onSave, onCancel, initialDate, initialEvent }: EventFormProps) {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(
    initialEvent?.date || (initialDate || new Date()).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '10:00');
  const [repeat, setRepeat] = useState<RepeatMode>(initialEvent?.repeat || 'none');
  const [category, setCategory] = useState(initialEvent?.category || 'routines');
  const [alarms, setAlarms] = useState<number[]>(initialEvent?.alarms || []);
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [timeError, setTimeError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Time validation
    if (endTime && endTime <= startTime) {
      setTimeError('La hora de fin debe ser posterior a la de inicio');
      return;
    }

    setTimeError(null);
    const selectedCategory = getCategoryById(category);

    const baseEvent = {
      title,
      startTime,
      endTime,
      repeat,
      category,
      isCompleted: initialEvent?.isCompleted ?? false,
      alarms,
      description,
      color: selectedCategory.color,
      groupId: initialEvent?.groupId,
    };

    if (initialEvent) {
      // Editing single instance
      onSave({ ...baseEvent, date, id: initialEvent.id });
    } else if (repeat === 'none') {
      onSave({ ...baseEvent, date });
    } else {
      // Unroll recurrences (New series)
      const groupId = Math.random().toString(36).substring(2, 11);
      const instances: (Omit<CalendarEvent, 'id'> & { id?: string })[] = [];
      const startDate = new Date(date + 'T00:00:00');
      
      let maxInstances = 0;
      if (repeat === 'daily') maxInstances = 365; // 1 year
      if (repeat === 'weekly') maxInstances = 104; // 2 years
      if (repeat === 'monthly') maxInstances = 24; // 2 years
      if (repeat === 'yearly') maxInstances = 5; // 5 years

      for (let i = 0; i < maxInstances; i++) {
        const d = new Date(startDate);
        if (repeat === 'daily') d.setDate(startDate.getDate() + i);
        if (repeat === 'weekly') d.setDate(startDate.getDate() + i * 7);
        if (repeat === 'monthly') d.setMonth(startDate.getMonth() + i);
        if (repeat === 'yearly') d.setFullYear(startDate.getFullYear() + i);
        
        instances.push({
          ...baseEvent,
          date: getDateString(d),
          groupId
        });
      }
      onSave(instances);
    }
  };

  const toggleAlarm = (value: number) => {
    setAlarms(prev => 
      prev.includes(value) 
        ? prev.filter(a => a !== value) 
        : [...prev, value]
    );
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    // Basic format check for HH:mm
    const [h, m] = value.split(':').map(Number);
    if (m >= 60) {
      // Correct invalid minutes to 59 if manually typed (some browsers allow this)
      const corrected = `${String(h).padStart(2, '0')}:59`;
      if (type === 'start') setStartTime(corrected);
      else setEndTime(corrected);
    } else {
      if (type === 'start') setStartTime(value);
      else setEndTime(value);
    }
    setTimeError(null); // Clear error when user changes time
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
          disabled={!title.trim() || !!timeError}
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
        <div className="event-form__field">
          <div className="event-form__field--row">
            <div className="event-form__subfield">
              <label className="event-form__label" htmlFor="event-start">Inicio</label>
              <input
                id="event-start"
                type="time"
                className={`event-form__input ${timeError ? 'event-form__input--error' : ''}`}
                value={startTime}
                onChange={e => handleTimeChange('start', e.target.value)}
              />
            </div>
            <div className="event-form__subfield">
              <label className="event-form__label" htmlFor="event-end">Fin</label>
              <input
                id="event-end"
                type="time"
                className={`event-form__input ${timeError ? 'event-form__input--error' : ''}`}
                value={endTime}
                onChange={e => handleTimeChange('end', e.target.value)}
              />
            </div>
          </div>
          {timeError && <div className="event-form__error-msg">{timeError}</div>}
        </div>

        {/* Category & Recurrence Row */}
        <div className="event-form__field event-form__field--row">
          <div className="event-form__subfield">
            <label className="event-form__label" htmlFor="event-category">Categoría</label>
            <select 
              id="event-category"
              className="event-form__select"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="event-form__subfield">
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
