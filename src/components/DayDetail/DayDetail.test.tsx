import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayDetail } from './index';
import type { CalendarEvent } from '../../types/types';
import { db } from '../../services/db';

vi.mock('../../services/db', () => ({
  db: {
    events: {
      update: vi.fn()
    }
  }
}));

describe('DayDetail', () => {
  const mockDate = new Date(2026, 4, 15); // 15 de mayo
  const mockEvents: CalendarEvent[] = [
    { id: '1', title: 'Reunión', date: '2026-05-15', startTime: '10:00', color: 'blue', category: 'work' },
    { id: '2', title: 'Comida', date: '2026-05-15', startTime: '14:00', endTime: '15:30', color: 'green', category: 'leisure' },
  ];

  it('renders correctly with date and events', () => {
    render(<DayDetail date={mockDate} events={mockEvents} onBack={() => {}} onEventClick={() => {}} />);
    expect(screen.getByText(/15 de mayo/i)).toBeInTheDocument();
    expect(screen.getByText('Reunión')).toBeInTheDocument();
    expect(screen.getByText('Comida')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('14:00')).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    render(<DayDetail date={mockDate} events={[]} onBack={() => {}} onEventClick={() => {}} />);
    expect(screen.getByText(/no hay eventos/i)).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const handleBack = vi.fn();
    render(<DayDetail date={mockDate} events={[]} onBack={handleBack} onEventClick={() => {}} />);
    fireEvent.click(screen.getByLabelText(/volver/i));
    expect(handleBack).toHaveBeenCalledOnce();
  });

  it('calls onEventClick when an event card is clicked', () => {
    const handleEventClick = vi.fn();
    render(<DayDetail date={mockDate} events={mockEvents} onBack={() => {}} onEventClick={handleEventClick} />);
    fireEvent.click(screen.getByTestId('event-card-1'));
    expect(handleEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('toggles event completion', () => {
    render(<DayDetail date={mockDate} events={mockEvents} onBack={() => {}} onEventClick={() => {}} />);
    const checkbox = screen.getAllByLabelText(/marcar como completado/i)[0];
    fireEvent.click(checkbox);
    expect(db.events.update).toHaveBeenCalled();
  });
});
