import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeekView from './WeekView';
import type { CalendarEvent } from '../../types/types';

describe('WeekView', () => {
  const mockDate = new Date(2026, 4, 15); // 15 de Mayo 2026 (Jueves)
  const mockEvents: CalendarEvent[] = [
    { id: '1', title: 'Test Event', date: '2026-05-15', startTime: '10:00', endTime: '11:00', color: 'blue', category: 'work' }
  ];

  it('renders 7 day headers', () => {
    render(
      <WeekView 
        currentDate={mockDate} 
        events={[]} 
        onDateSelect={() => {}} 
        onEventClick={() => {}}
      />
    );
    const dayNumbers = screen.getAllByText(/[0-9]+/);
    // At least 7 numbers in the header
    expect(dayNumbers.length).toBeGreaterThanOrEqual(7);
  });

  it('renders hour labels from 0:00 to 23:00', () => {
    render(
      <WeekView 
        currentDate={mockDate} 
        events={[]} 
        onDateSelect={() => {}} 
        onEventClick={() => {}}
      />
    );
    expect(screen.getByText('0:00')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText('23:00')).toBeInTheDocument();
  });

  it('renders events in the view', () => {
    render(
      <WeekView 
        currentDate={mockDate} 
        events={mockEvents} 
        onDateSelect={() => {}} 
        onEventClick={() => {}}
      />
    );
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getAllByText('10:00').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onDateSelect when a day header is clicked', () => {
    const onDateSelect = vi.fn();
    render(
      <WeekView 
        currentDate={mockDate} 
        events={[]} 
        onDateSelect={onDateSelect} 
        onEventClick={() => {}}
      />
    );
    
    // Click on the day number 15 (should be one of them)
    const day15 = screen.getByText('15');
    fireEvent.click(day15);
    
    expect(onDateSelect).toHaveBeenCalled();
  });

  it('calls onEventClick when an event is clicked', () => {
    const onEventClick = vi.fn();
    render(
      <WeekView 
        currentDate={mockDate} 
        events={mockEvents} 
        onDateSelect={() => {}} 
        onEventClick={onEventClick}
      />
    );
    
    fireEvent.click(screen.getByText('Test Event'));
    expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });
});
