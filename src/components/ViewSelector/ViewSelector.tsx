import type { ViewMode } from '../../types/types';
import './ViewSelector.scss';

interface ViewSelectorProps {
  currentView: ViewMode;
  onChange: (view: ViewMode) => void;
}

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'year', label: 'Año' },
  { id: 'month', label: 'Mes' },
  { id: 'week', label: 'Semana' },
];

export default function ViewSelector({ currentView, onChange }: ViewSelectorProps) {
  return (
    <div className="view-selector">
      <div className="view-selector__container">
        {VIEWS.map((view) => (
          <button
            key={view.id}
            className={`view-selector__btn ${currentView === view.id ? 'view-selector__btn--active' : ''}`}
            onClick={() => onChange(view.id)}
            data-testid={`view-selector-${view.id}`}
            aria-pressed={currentView === view.id}
          >
            {view.label}
          </button>
        ))}
      </div>
    </div>
  );
}
