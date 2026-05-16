import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EventForm from './EventForm';

describe('EventForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<EventForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    expect(screen.getByPlaceholderText('Título del evento')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha')).toBeInTheDocument();
    expect(screen.getByLabelText('Inicio')).toBeInTheDocument();
    expect(screen.getByLabelText('Fin')).toBeInTheDocument();
    expect(screen.getByLabelText('Repetir')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
  });

  it('updates input values on change', () => {
    render(<EventForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    const titleInput = screen.getByPlaceholderText('Título del evento') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Nueva Reunión' } });
    expect(titleInput.value).toBe('Nueva Reunión');
  });

  it('calls onCancel when clicking the close icon', () => {
    render(<EventForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    const cancelBtn = screen.getByLabelText('Cancelar');
    fireEvent.click(cancelBtn);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables save button when title is empty', () => {
    render(<EventForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    const saveBtn = screen.getByLabelText('Guardar');
    expect(saveBtn).toBeDisabled();
    
    const titleInput = screen.getByPlaceholderText('Título del evento');
    fireEvent.change(titleInput, { target: { value: 'Algo' } });
    expect(saveBtn).not.toBeDisabled();
  });

  it('submits correctly when saving', () => {
    render(<EventForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    fireEvent.change(screen.getByPlaceholderText('Título del evento'), { target: { value: 'Test' } });
    fireEvent.click(screen.getByLabelText('Guardar'));
    
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test',
      repeat: 'none'
    }));
  });

  it('allows toggling alarms', () => {
    render(<EventForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    const alarmBtn = screen.getByText('10 min');
    fireEvent.click(alarmBtn);
    expect(alarmBtn).toHaveClass('event-form__alarm-pill--active');
    
    fireEvent.click(alarmBtn);
    expect(alarmBtn).not.toHaveClass('event-form__alarm-pill--active');
  });

  it('pre-fills data when editing an event', () => {
    const initialEvent = {
      id: '123',
      title: 'Evento Existente',
      date: '2026-06-01',
      startTime: '15:00',
      endTime: '16:00',
      category: 'sports',
      color: '#22c55e',
      repeat: 'weekly' as const,
      description: 'Desc test'
    };
    render(<EventForm onSave={mockOnSave} onCancel={mockOnCancel} initialEvent={initialEvent} />);
    
    expect(screen.getByDisplayValue('Evento Existente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-06-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('15:00')).toBeInTheDocument();
    expect(screen.getByText('Deportes')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Desc test')).toBeInTheDocument();
  });

  it('unrolls recurrences when saving a new recurring event', () => {
    render(<EventForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    fireEvent.change(screen.getByPlaceholderText('Título del evento'), { target: { value: 'Serie' } });
    fireEvent.change(screen.getByLabelText('Repetir'), { target: { value: 'daily' } });
    fireEvent.click(screen.getByLabelText('Guardar'));
    
    expect(mockOnSave).toHaveBeenCalledWith(expect.any(Array));
    const savedArray = mockOnSave.mock.calls[0][0];
    expect(savedArray.length).toBe(365); // Daily for 1 year
    expect(savedArray[0].title).toBe('Serie');
    expect(savedArray[0].groupId).toBeDefined();
  });

  it('shows error when end time is before start time', () => {
    render(<EventForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    fireEvent.change(screen.getByPlaceholderText('Título del evento'), { target: { value: 'Error' } });
    fireEvent.change(screen.getByLabelText('Inicio'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('Fin'), { target: { value: '09:00' } });
    fireEvent.click(screen.getByLabelText('Guardar'));
    
    expect(screen.getByText(/la hora de fin debe ser posterior/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
