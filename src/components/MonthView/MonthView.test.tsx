import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MonthView from './MonthView';
import type { CalendarEvent } from '../../types/types';

describe('MonthView', () => {
  const mockDate = new Date(2026, 4, 1); // Mayo 2026

  it('renders a multiple of 7 day cells', () => {
    render(
      <MonthView 
        currentDate={mockDate} 
        events={[]} 
        onDateSelect={() => {}} 
      />
    );
    const daysGrid = screen.getByTestId('calendar-days');
    expect(daysGrid.children.length % 7).toBe(0);
  });

  it('calls onDateSelect when a day is clicked', () => {
    const onDateSelect = vi.fn();
    render(
      <MonthView 
        currentDate={mockDate} 
        events={[]} 
        onDateSelect={onDateSelect} 
      />
    );

    const dayButtons = screen.getAllByTestId('calendar-day-15');
    fireEvent.click(dayButtons[0]);

    expect(onDateSelect).toHaveBeenCalledOnce();
    expect(onDateSelect).toHaveBeenCalledWith(expect.any(Date));
  });

  it('renders event titles in the grid', () => {
    const events: CalendarEvent[] = [
      { id: '1', title: 'Reunión Importante', date: '2026-05-15', startTime: '10:00', color: 'red', category: 'work' },
    ];
    render(
      <MonthView 
        currentDate={mockDate} 
        events={events} 
        onDateSelect={() => {}} 
      />
    );

    expect(screen.getByText('Reunión Importante')).toBeInTheDocument();
  });

  it('shows +N indicator when there are more than 3 events', () => {
    const events: CalendarEvent[] = [
      { id: '1', title: 'Ev1', date: '2026-05-15', startTime: '10:00', color: 'red', category: 'work' },
      { id: '2', title: 'Ev2', date: '2026-05-15', startTime: '11:00', color: 'blue', category: 'work' },
      { id: '3', title: 'Ev3', date: '2026-05-15', startTime: '12:00', color: 'green', category: 'work' },
      { id: '4', title: 'Ev4', date: '2026-05-15', startTime: '13:00', color: 'yellow', category: 'work' },
    ];
    render(
      <MonthView 
        currentDate={mockDate} 
        events={events} 
        onDateSelect={() => {}} 
      />
    );

    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
