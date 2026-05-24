import { useState, useEffect, useRef } from 'react';
import type { AppView, ViewMode } from '../../types/types';
import calendarIcon from '../../assets/icons/calendar.svg?raw';
import clockIcon from '../../assets/icons/clock.svg?raw';
import yearIcon from '../../assets/icons/year.svg?raw';
import monthIcon from '../../assets/icons/month.svg?raw';
import weekIcon from '../../assets/icons/week.svg?raw';
import './ViewSelector.scss';

interface ViewSelectorProps {
  currentView: AppView;
  currentViewMode: ViewMode;
  onNavigate: (view: AppView, mode?: ViewMode) => void;
}

export default function ViewSelector({ currentView, currentViewMode, onNavigate }: ViewSelectorProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<'calendar' | 'clock' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close submenu if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveSubmenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCalendarClick = () => {
    setActiveSubmenu(prev => prev === 'calendar' ? null : 'calendar');
  };

  const handleClockClick = () => {
    setActiveSubmenu(prev => prev === 'clock' ? null : 'clock');
  };

  const isCalendarActive = currentView === 'calendar';
  const isClockActive = currentView === 'alarms' || currentView === 'timers';

  return (
    <nav className="view-selector" ref={containerRef}>
      <div className="view-selector__container">
        
        {/* TAB CALENDARIO */}
        <div className="view-selector__tab-wrapper">
          {/* Submenú Calendario */}
          {activeSubmenu === 'calendar' && (
            <div className="view-selector__submenu view-selector__submenu--calendar" role="menu">
              <button
                className={`view-selector__submenu-item ${currentViewMode === 'year' && isCalendarActive ? 'view-selector__submenu-item--active' : ''}`}
                onClick={() => {
                  onNavigate('calendar', 'year');
                  setActiveSubmenu(null);
                }}
                data-testid="view-selector-year"
                role="menuitem"
              >
                <span className="view-selector__submenu-icon" dangerouslySetInnerHTML={{ __html: yearIcon }} />
                <span>Año</span>
              </button>
              <button
                className={`view-selector__submenu-item ${currentViewMode === 'month' && isCalendarActive ? 'view-selector__submenu-item--active' : ''}`}
                onClick={() => {
                  onNavigate('calendar', 'month');
                  setActiveSubmenu(null);
                }}
                data-testid="view-selector-month"
                role="menuitem"
              >
                <span className="view-selector__submenu-icon" dangerouslySetInnerHTML={{ __html: monthIcon }} />
                <span>Mes</span>
              </button>
              <button
                className={`view-selector__submenu-item ${currentViewMode === 'week' && isCalendarActive ? 'view-selector__submenu-item--active' : ''}`}
                onClick={() => {
                  onNavigate('calendar', 'week');
                  setActiveSubmenu(null);
                }}
                data-testid="view-selector-week"
                role="menuitem"
              >
                <span className="view-selector__submenu-icon" dangerouslySetInnerHTML={{ __html: weekIcon }} />
                <span>Semana</span>
              </button>
            </div>
          )}

          <button
            className={`view-selector__btn ${isCalendarActive ? 'view-selector__btn--active' : ''}`}
            onClick={handleCalendarClick}
            data-testid="view-selector-calendar-tab"
            aria-haspopup="true"
            aria-expanded={activeSubmenu === 'calendar'}
          >
            <span 
              className="view-selector__icon" 
              dangerouslySetInnerHTML={{ __html: calendarIcon }} 
            />
            <span className="view-selector__label">Calendario</span>
          </button>
        </div>

        {/* TAB RELOJ */}
        <div className="view-selector__tab-wrapper">
          {/* Submenú Reloj */}
          {activeSubmenu === 'clock' && (
            <div className="view-selector__submenu view-selector__submenu--clock" role="menu">
              <button
                className={`view-selector__submenu-item ${currentView === 'alarms' ? 'view-selector__submenu-item--active' : ''}`}
                onClick={() => {
                  onNavigate('alarms');
                  setActiveSubmenu(null);
                }}
                data-testid="view-selector-alarms"
                role="menuitem"
              >
                <span className="view-selector__submenu-icon" dangerouslySetInnerHTML={{ __html: clockIcon }} />
                <span>Alarmas</span>
              </button>
              <button
                className={`view-selector__submenu-item ${currentView === 'timers' ? 'view-selector__submenu-item--active' : ''}`}
                onClick={() => {
                  onNavigate('timers');
                  setActiveSubmenu(null);
                }}
                data-testid="view-selector-timers"
                role="menuitem"
              >
                <span className="view-selector__submenu-icon" dangerouslySetInnerHTML={{ __html: clockIcon }} />
                <span>Temporizadores</span>
              </button>
            </div>
          )}

          <button
            className={`view-selector__btn ${isClockActive ? 'view-selector__btn--active' : ''}`}
            onClick={handleClockClick}
            data-testid="view-selector-clock-tab"
            aria-haspopup="true"
            aria-expanded={activeSubmenu === 'clock'}
          >
            <span 
              className="view-selector__icon" 
              dangerouslySetInnerHTML={{ __html: clockIcon }} 
            />
            <span className="view-selector__label">Reloj</span>
          </button>
        </div>

      </div>
    </nav>
  );
}
