import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimersView from './TimersView';

// Mock DB
vi.mock('../../services/db', () => {
  const mockTable = {
    toArray: vi.fn(() => Promise.resolve([])),
    add: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve())
  };
  return {
    db: {
      customTimers: mockTable
    }
  };
});

describe('TimersView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state correctly', async () => {
    const mockOnAddTimer = vi.fn();
    render(<TimersView onAddTimer={mockOnAddTimer} />);
    expect(screen.getByText('Temporizadores')).toBeInTheDocument();
    expect(screen.getByText('No hay temporizadores activos')).toBeInTheDocument();
    expect(screen.getByText('No tienes temporizadores guardados')).toBeInTheDocument();
  });

  it('triggers onAddTimer when clicking the FAB button', async () => {
    const mockOnAddTimer = vi.fn();
    render(<TimersView onAddTimer={mockOnAddTimer} />);
    
    const fab = screen.getByLabelText('Agregar temporizador');
    fireEvent.click(fab);

    expect(mockOnAddTimer).toHaveBeenCalled();
  });
});
