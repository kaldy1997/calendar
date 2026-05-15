import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EventForm from './EventForm';

describe('EventForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

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
});
