import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TimerForm from './TimerForm';
import { db } from '../../services/db';

vi.mock('../../services/db', () => {
  const mockTable = {
    add: vi.fn(() => Promise.resolve())
  };
  return {
    db: {
      customTimers: mockTable
    }
  };
});

describe('TimerForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and handles Cancel click', () => {
    const mockOnClose = vi.fn();
    render(<TimerForm onClose={mockOnClose} />);
    
    expect(screen.getByText('Nuevo Temporizador')).toBeInTheDocument();
    
    const cancelBtn = screen.getByLabelText('Cancelar');
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('allows entering time values and saving preset', async () => {
    const mockOnClose = vi.fn();
    render(<TimerForm onClose={mockOnClose} />);

    const hoursInput = screen.getByTestId('timer-hours-input');
    const minutesInput = screen.getByTestId('timer-minutes-input');
    const secondsInput = screen.getByTestId('timer-seconds-input');
    const saveBtn = screen.getByLabelText('Guardar');

    fireEvent.change(hoursInput, { target: { value: '1' } });
    fireEvent.change(minutesInput, { target: { value: '15' } });
    fireEvent.change(secondsInput, { target: { value: '30' } });

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // 1h 15m 30s = 3600 + 900 + 30 = 4530 seconds
    expect(db.customTimers.add).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 4530
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });
});
