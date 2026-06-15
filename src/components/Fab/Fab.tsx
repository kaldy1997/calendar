import plusIcon from '../../assets/icons/plus.svg?raw';
import './Fab.scss';

interface FabProps {
  onClick: () => void;
  'aria-label'?: string;
}

export default function Fab({ onClick, 'aria-label': ariaLabel = 'Añadir evento' }: FabProps) {
  return (
    <button
      className="fab"
      onClick={onClick}
      aria-label={ariaLabel}
      data-testid="fab-button"
      dangerouslySetInnerHTML={{ __html: plusIcon }}
    />
  );
}
