import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar from './Calendar';

describe('Calendar', () => {
  it('renders correctly', () => {
    render(<Calendar />);
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('handles navigation via swipes in MonthView', () => {
    const onMonthChange = vi.fn();
    render(<Calendar onMonthChange={onMonthChange} />);
    const view = screen.getByTestId('month-view');
    
    // Swipe left (next month)
    fireEvent.touchStart(view, { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(view, { changedTouches: [{ clientX: 100 }] });
    
    expect(onMonthChange).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
  });

  it('handles navigation via swipes in WeekView', () => {
    const onMonthChange = vi.fn();
    render(<Calendar viewMode="week" onMonthChange={onMonthChange} />);
    const view = screen.getByTestId('week-view');
    
    // Swipe right (prev week)
    fireEvent.touchStart(view, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(view, { changedTouches: [{ clientX: 300 }] });
    
    expect(onMonthChange).toHaveBeenCalled();
  });

  it('handles goToToday', () => {
    const onMonthChange = vi.fn();
    render(<Calendar onMonthChange={onMonthChange} />);
    const todayBtn = screen.getByTestId('calendar-today-btn');
    fireEvent.click(todayBtn);
    expect(onMonthChange).toHaveBeenCalled();
  });

  it('handles handleMonthSelect from YearView', () => {
    const onViewChange = vi.fn();
    render(<Calendar viewMode="year" onViewChange={onViewChange} />);
    fireEvent.click(screen.getByText(/enero/i));
    expect(onViewChange).toHaveBeenCalledWith('month');
  });
});
