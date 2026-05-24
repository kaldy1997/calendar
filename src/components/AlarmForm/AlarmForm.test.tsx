import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AlarmForm from './AlarmForm';
import { db } from '../../services/db';
import { alarmService } from '../../services/alarmService';

vi.mock('../../services/db', () => {
  const mockTable = {
    add: vi.fn(() => Promise.resolve()),
    put: vi.fn(() => Promise.resolve())
  };
  return {
    db: {
      customAlarms: mockTable
    }
  };
});

vi.mock('../../services/alarmService', () => {
  return {
    alarmService: {
      scheduleCustomAlarm: vi.fn(() => Promise.resolve()),
      cancelCustomAlarm: vi.fn(() => Promise.resolve())
    }
  };
});

describe('AlarmForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and handles Cancel click', () => {
    const mockOnClose = vi.fn();
    render(<AlarmForm onClose={mockOnClose} />);

    expect(screen.getByText('Nueva Alarma')).toBeInTheDocument();
    
    const cancelBtn = screen.getByLabelText('Cancelar');
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('allows scheduling an alarm and saving it', async () => {
    const mockOnClose = vi.fn();
    render(<AlarmForm onClose={mockOnClose} />);

    const timeInput = screen.getByTestId('alarm-time-input');
    const repeatSelect = screen.getByTestId('alarm-repeat-select');
    const saveBtn = screen.getByLabelText('Guardar');

    fireEvent.change(timeInput, { target: { value: '07:15' } });
    fireEvent.change(repeatSelect, { target: { value: 'daily' } });

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(db.customAlarms.add).toHaveBeenCalledWith(
      expect.objectContaining({
        time: '07:15',
        repeat: 'daily'
      })
    );
    expect(alarmService.scheduleCustomAlarm).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('allows editing an existing alarm and saving it', async () => {
    const mockOnClose = vi.fn();
    const existingAlarm = {
      id: 'alarm-123',
      time: '09:30',
      repeat: 'once' as const,
      deleteOnRing: true,
      isActive: true,
      nextTriggerTime: 1234567890
    };

    render(<AlarmForm onClose={mockOnClose} alarm={existingAlarm} />);

    expect(screen.getByText('Editar Alarma')).toBeInTheDocument();

    const timeInput = screen.getByTestId('alarm-time-input');
    const repeatSelect = screen.getByTestId('alarm-repeat-select');
    const saveBtn = screen.getByLabelText('Guardar');

    expect(timeInput).toHaveValue('09:30');
    expect(repeatSelect).toHaveValue('once');

    fireEvent.change(timeInput, { target: { value: '10:00' } });
    fireEvent.change(repeatSelect, { target: { value: 'weekday' } });

    await act(async () => {
      fireEvent.click(saveBtn);
    });

    expect(db.customAlarms.put).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'alarm-123',
        time: '10:00',
        repeat: 'weekday',
        isActive: true
      })
    );
    expect(alarmService.cancelCustomAlarm).toHaveBeenCalledWith('alarm-123');
    expect(alarmService.scheduleCustomAlarm).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
