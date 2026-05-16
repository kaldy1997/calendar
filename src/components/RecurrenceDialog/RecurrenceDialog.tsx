import './RecurrenceDialog.scss';

interface RecurrenceDialogProps {
  title: string;
  onSelect: (option: 'single' | 'future' | 'all') => void;
  onCancel: () => void;
}

export default function RecurrenceDialog({ title, onSelect, onCancel }: RecurrenceDialogProps) {
  return (
    <div className="recurrence-dialog-overlay" onClick={onCancel}>
      <div className="recurrence-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="recurrence-dialog__title">{title}</h3>
        <p className="recurrence-dialog__message">Este evento es parte de una serie. ¿Qué quieres hacer?</p>
        
        <div className="recurrence-dialog__options">
          <button 
            className="recurrence-dialog__btn" 
            onClick={() => onSelect('single')}
          >
            Solo este evento
          </button>
          <button 
            className="recurrence-dialog__btn" 
            onClick={() => onSelect('future')}
          >
            Este y los siguientes
          </button>
          <button 
            className="recurrence-dialog__btn" 
            onClick={() => onSelect('all')}
          >
            Toda la serie
          </button>
        </div>
        
        <button className="recurrence-dialog__cancel" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
