import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { Fab } from '../Fab';
import type { ConfiguredTimer, ActiveTimer } from '../../types/types';
import './TimersView.scss';

interface TimersViewProps {
  onAddTimer: () => void;
}

export default function TimersView({ onAddTimer }: TimersViewProps) {
  // Local state for active running timers
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);

  // Configured Timers query
  const presets = useLiveQuery(() => db.customTimers.toArray()) || [];

  // Update timer seconds every 200ms
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        let changed = false;
        const updated = prev.map(t => {
          if (t.isRunning && t.startTime) {
            const elapsed = Math.floor((Date.now() - t.startTime) / 1000);
            const currentElapsed = t.elapsedBefore + elapsed;
            const remaining = Math.max(0, t.duration - currentElapsed);

            if (remaining !== t.remainingSeconds) {
              changed = true;
              return {
                ...t,
                remainingSeconds: remaining,
                isRunning: remaining > 0 ? t.isRunning : false
              };
            }
          }
          return t;
        });
        return changed ? updated : prev;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleDeletePreset = async (id: string) => {
    await db.customTimers.delete(id);
  };

  // Launch a new active timer from a preset
  const handleStartPreset = (preset: ConfiguredTimer) => {
    const newActive: ActiveTimer = {
      id: Math.random().toString(36).substring(2, 11),
      configuredTimerId: preset.id,
      duration: preset.duration,
      remainingSeconds: preset.duration,
      isRunning: true,
      startTime: Date.now(),
      elapsedBefore: 0
    };
    setActiveTimers(prev => [newActive, ...prev]);
  };

  // Pause a running active timer
  const handlePauseTimer = (id: string) => {
    setActiveTimers(prev =>
      prev.map(t => {
        if (t.id === id && t.isRunning && t.startTime) {
          const elapsed = Math.floor((Date.now() - t.startTime) / 1000);
          return {
            ...t,
            isRunning: false,
            elapsedBefore: t.elapsedBefore + elapsed,
            startTime: undefined
          };
        }
        return t;
      })
    );
  };

  // Resume a paused active timer
  const handleResumeTimer = (id: string) => {
    setActiveTimers(prev =>
      prev.map(t => {
        if (t.id === id && !t.isRunning) {
          return {
            ...t,
            isRunning: true,
            startTime: Date.now()
          };
        }
        return t;
      })
    );
  };

  // Cancel/Remove active timer
  const handleCancelTimer = (id: string) => {
    setActiveTimers(prev => prev.filter(t => t.id !== id));
  };

  const formatDuration = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    const pad = (n: number) => String(n).padStart(2, '0');

    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  return (
    <div className="timers-view" data-testid="timers-view">
      <header className="timers-view__header">
        <h1 className="timers-view__title">Temporizadores</h1>
      </header>

      <div className="timers-view__content">
        
        {/* SECTION 1: ACTIVE TIMERS (TOP) */}
        <section className="timers-view__section">
          <h2 className="timers-view__section-title">Temporizadores activos</h2>
          {activeTimers.length === 0 ? (
            <div className="timers-view__empty">No hay temporizadores activos</div>
          ) : (
            <div className="timers-view__active-list">
              {activeTimers.map((timer) => {
                const percentage = (timer.remainingSeconds / timer.duration) * 100;
                const isFinished = timer.remainingSeconds === 0;

                return (
                  <div 
                    className={`timers-view__active-card ${isFinished ? 'timers-view__active-card--finished' : ''}`}
                    key={timer.id}
                    data-testid={`active-timer-card-${timer.id}`}
                  >
                    <div className="timers-view__active-info">
                      <span className="timers-view__active-digits">
                        {formatDuration(timer.remainingSeconds)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="timers-view__progress-bar-container">
                      <div 
                        className="timers-view__progress-bar" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <div className="timers-view__active-actions">
                      {isFinished ? (
                        <span className="timers-view__finished-text">¡Terminado!</span>
                      ) : (
                        <>
                          {timer.isRunning ? (
                            <button
                              className="timers-view__btn-control timers-view__btn-control--icon timers-view__btn-control--pause"
                              onClick={() => handlePauseTimer(timer.id)}
                              aria-label="Pausar"
                              data-testid={`active-timer-pause-${timer.id}`}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              className="timers-view__btn-control timers-view__btn-control--icon timers-view__btn-control--resume"
                              onClick={() => handleResumeTimer(timer.id)}
                              aria-label="Reanudar"
                              data-testid={`active-timer-resume-${timer.id}`}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            </button>
                          )}
                        </>
                      )}
                      
                      <button
                        className="timers-view__btn-control timers-view__btn-control--icon timers-view__btn-control--cancel"
                        onClick={() => handleCancelTimer(timer.id)}
                        aria-label={isFinished ? "Cerrar" : "Parar"}
                        data-testid={`active-timer-cancel-${timer.id}`}
                      >
                        {isFinished ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: CONFIG PRESETS (BOTTOM) */}
        <section className="timers-view__section">
          <h2 className="timers-view__section-title">Mis temporizadores</h2>
          {presets.length === 0 ? (
            <div className="timers-view__empty">No tienes temporizadores guardados</div>
          ) : (
            <div className="timers-view__preset-list">
              {presets.map((preset) => (
                <div 
                  className="timers-view__preset-item" 
                  key={preset.id}
                  data-testid={`preset-timer-item-${preset.id}`}
                >
                  <div className="timers-view__preset-details">
                    <span className="timers-view__preset-duration-large">{formatDuration(preset.duration)}</span>
                  </div>

                  <div className="timers-view__preset-actions">
                    <button
                      className="timers-view__preset-start"
                      onClick={() => handleStartPreset(preset)}
                      aria-label="Iniciar temporizador"
                      data-testid={`preset-timer-start-${preset.id}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </button>
                    <button
                      className="timers-view__preset-delete"
                      onClick={() => handleDeletePreset(preset.id)}
                      aria-label="Eliminar temporizador"
                      data-testid={`preset-timer-delete-${preset.id}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* FLOATING ACTION BUTTON */}
      <Fab onClick={onAddTimer} aria-label="Agregar temporizador" />
    </div>
  );
}
