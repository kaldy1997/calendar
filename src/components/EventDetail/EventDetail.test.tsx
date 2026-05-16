import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EventDetail from './EventDetail';
import type { CalendarEvent } from '../../types/types';

describe('EventDetail', () => {
  const mockEvent: CalendarEvent = {
    id: '1',
    title: 'Evento de Prueba',
    date: '2026-05-15',
    startTime: '10:00',
    endTime: '12:00',
    description: 'Una descripción detallada',
    category: 'work',
    color: '#f97316',
    repeat: 'weekly',
    alarms: [15, 60]
  };

  const mockProps = {
    event: mockEvent,
    onClose: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn()
  };

  it('renders event details correctly', () => {
    render(<EventDetail {...mockProps} />);
    
    expect(screen.getByText('Evento de Prueba')).toBeInTheDocument();
    expect(screen.getByText('Una descripción detallada')).toBeInTheDocument();
    expect(screen.getByText(/viernes, 15 de mayo de 2026/i)).toBeInTheDocument();
    expect(screen.getByText('10:00 — 12:00')).toBeInTheDocument();
    expect(screen.getByText('Semanalmente')).toBeInTheDocument();
    expect(screen.getByText('Trabajo')).toBeInTheDocument();
    expect(screen.getByText('15 min antes')).toBeInTheDocument();
    expect(screen.getByText('1 h antes')).toBeInTheDocument();
  });

  it('calls onClose when back button is clicked', () => {
    render(<EventDetail {...mockProps} />);
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<EventDetail {...mockProps} />);
    fireEvent.click(screen.getByText('Editar'));
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockEvent);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<EventDetail {...mockProps} />);
    fireEvent.click(screen.getByText('Eliminar'));
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockEvent);
  });
});
