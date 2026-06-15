import { useState } from 'react';
import { db } from '../../services/db';
import { alarmService } from '../../services/alarmService';
import type { CustomAlarm, CustomAlarmRepeat } from '../../types/types';
import closeIcon from '../../assets/icons/close.svg?raw';
import checkIcon from '../../assets/icons/check.svg?raw';
import './AlarmForm.scss';

const icons = {
  close: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: closeIcon }} />,
  save: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: checkIcon }} />
};

interface AlarmFormProps {
  onClose: () => void;
  alarm?: CustomAlarm | null;
}

export default function AlarmForm({ onClose, alarm }: AlarmFormProps) {
  const [alarmTime, setAlarmTime] = useState(alarm ? alarm.time : '08:00');
  const [alarmRepeat, setAlarmRepeat] = useState<CustomAlarmRepeat>(alarm ? alarm.repeat : 'once');
  const [deleteOnRing, setDeleteOnRing] = useState(alarm ? (alarm.deleteOnRing ?? true) : true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let nextTriggerTime: number | undefined;

    if (alarmRepeat === 'once') {
      const [hours, minutes] = alarmTime.split(':').map(Number);
      const now = new Date();
      const trigger = new Date();
      trigger.setHours(hours, minutes, 0, 0);
      if (trigger <= now) {
        trigger.setDate(trigger.getDate() + 1);
      }
      nextTriggerTime = trigger.getTime();
    }

    if (alarm) {
      const updatedAlarm: CustomAlarm = {
        ...alarm,
        time: alarmTime,
        repeat: alarmRepeat,
        deleteOnRing: alarmRepeat === 'once' ? deleteOnRing : false,
        isActive: true,
        nextTriggerTime
      };

      await db.customAlarms.put(updatedAlarm);
      await alarmService.cancelCustomAlarm(alarm.id);
      if (updatedAlarm.isActive) {
        await alarmService.scheduleCustomAlarm(updatedAlarm);
      }
    } else {
      const id = Math.random().toString(36).substring(2, 11);
      const newAlarm: CustomAlarm = {
        id,
        time: alarmTime,
        repeat: alarmRepeat,
        deleteOnRing: alarmRepeat === 'once' ? deleteOnRing : false,
        isActive: true,
        nextTriggerTime
      };

      await db.customAlarms.add(newAlarm);
      await alarmService.scheduleCustomAlarm(newAlarm);
    }

    onClose();
  };

  return (
    <div className="alarm-form">
      <div className="alarm-form__header">
        <button className="alarm-form__cancel" onClick={onClose} aria-label="Cancelar">
          {icons.close}
        </button>
        <h2 className="alarm-form__header-title">{alarm ? 'Editar Alarma' : 'Nueva Alarma'}</h2>
        <button 
          className="alarm-form__save" 
          onClick={handleSubmit}
          aria-label="Guardar"
        >
          {icons.save}
        </button>
      </div>

      <form className="alarm-form__content" onSubmit={handleSubmit}>
        
        {/* Hora */}
        <div className="alarm-form__field">
          <label className="alarm-form__label" htmlFor="alarm-time">Hora</label>
          <input 
            id="alarm-time"
            type="time" 
            className="alarm-form__input-time"
            value={alarmTime}
            onChange={(e) => setAlarmTime(e.target.value)}
            required
            data-testid="alarm-time-input"
            autoFocus
          />
        </div>

        {/* Repetir */}
        <div className="alarm-form__field">
          <label className="alarm-form__label" htmlFor="alarm-repeat">Repetir</label>
          <select 
            id="alarm-repeat"
            className="alarm-form__select"
            value={alarmRepeat}
            onChange={(e) => setAlarmRepeat(e.target.value as CustomAlarmRepeat)}
            data-testid="alarm-repeat-select"
          >
            <option value="once">Una vez</option>
            <option value="daily">Diariamente</option>
            <option value="weekday">De lunes a viernes</option>
          </select>
        </div>

        {/* Delete on ring checkbox */}
        {alarmRepeat === 'once' && (
          <div className="alarm-form__field alarm-form__field--row">
            <label className="alarm-form__checkbox-label" htmlFor="alarm-delete-on-ring">
              <input 
                id="alarm-delete-on-ring"
                type="checkbox" 
                className="alarm-form__checkbox"
                checked={deleteOnRing}
                onChange={(e) => setDeleteOnRing(e.target.checked)}
                data-testid="alarm-delete-on-ring-checkbox"
              />
              <span>Eliminar alarma tras sonar</span>
            </label>
          </div>
        )}
      </form>
    </div>
  );
}
