import { useState } from 'react';
import { db } from '../../services/db';
import type { ConfiguredTimer } from '../../types/types';
import closeIcon from '../../assets/icons/close.svg?raw';
import checkIcon from '../../assets/icons/check.svg?raw';
import './TimerForm.scss';

const icons = {
  close: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: closeIcon }} />,
  save: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: checkIcon }} />
};

interface TimerFormProps {
  onClose: () => void;
}

export default function TimerForm({ onClose }: TimerFormProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 0) return;

    const id = Math.random().toString(36).substring(2, 11);
    const newPreset: ConfiguredTimer = {
      id,
      duration: totalSeconds
    };

    await db.customTimers.add(newPreset);
    onClose();
  };

  const isFormValid = hours > 0 || minutes > 0 || seconds > 0;

  return (
    <div className="timer-form">
      <div className="timer-form__header">
        <button className="timer-form__cancel" onClick={onClose} aria-label="Cancelar">
          {icons.close}
        </button>
        <h2 className="timer-form__header-title">Nuevo Temporizador</h2>
        <button 
          className="timer-form__save" 
          onClick={handleSubmit}
          disabled={!isFormValid}
          aria-label="Guardar"
        >
          {icons.save}
        </button>
      </div>

      <form className="timer-form__content" onSubmit={handleSubmit}>
        
        {/* Duración */}
        <div className="timer-form__field">
          <label className="timer-form__label">Duración</label>
          <div className="timer-form__time-inputs">
            
            <div className="timer-form__time-subfield">
              <input 
                type="number" 
                min="0" 
                max="23"
                className="timer-form__input-number"
                value={hours}
                onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                data-testid="timer-hours-input"
                autoFocus
              />
              <span>h</span>
            </div>

            <div className="timer-form__time-subfield">
              <input 
                type="number" 
                min="0" 
                max="59"
                className="timer-form__input-number"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                data-testid="timer-minutes-input"
              />
              <span>m</span>
            </div>

            <div className="timer-form__time-subfield">
              <input 
                type="number" 
                min="0" 
                max="59"
                className="timer-form__input-number"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                data-testid="timer-seconds-input"
              />
              <span>s</span>
            </div>
            
          </div>
        </div>

      </form>
    </div>
  );
}
