import type { ViewMode } from '../../types/types';
import yearIcon from '../../assets/icons/year.svg?raw';
import monthIcon from '../../assets/icons/month.svg?raw';
import weekIcon from '../../assets/icons/week.svg?raw';
import './ViewSelector.scss';

interface ViewSelectorProps {
  currentView: ViewMode;
  onChange: (view: ViewMode) => void;
}

const VIEWS: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'year', label: 'Año', icon: yearIcon },
  { id: 'month', label: 'Mes', icon: monthIcon },
  { id: 'week', label: 'Semana', icon: weekIcon },
];

export default function ViewSelector({ currentView, onChange }: ViewSelectorProps) {
  return (
    <nav className="view-selector">
      <div className="view-selector__container">
        {VIEWS.map((view) => (
          <button
            key={view.id}
            className={`view-selector__btn ${currentView === view.id ? 'view-selector__btn--active' : ''}`}
            onClick={() => onChange(view.id)}
            data-testid={`view-selector-${view.id}`}
            aria-pressed={currentView === view.id}
          >
            <span 
              className="view-selector__icon" 
              dangerouslySetInnerHTML={{ __html: view.icon }} 
            />
            <span className="view-selector__label">{view.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
