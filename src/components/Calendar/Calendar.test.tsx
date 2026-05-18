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
    const view = screen.getAllByTestId('month-view')[1];
    
    // Swipe left (next month)
    fireEvent.touchStart(view, { touches: [{ clientX: 300, clientY: 0 }] });
    fireEvent.touchMove(view, { touches: [{ clientX: 100, clientY: 0 }] });
    fireEvent.touchEnd(view, { changedTouches: [{ clientX: 100, clientY: 0 }] });
    
    expect(onMonthChange).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
  });

  it('handles navigation via swipes in WeekView', () => {
    const onMonthChange = vi.fn();
    render(<Calendar viewMode="week" onMonthChange={onMonthChange} />);
    const view = screen.getAllByTestId('week-view')[1];
    
    // Swipe right (prev week)
    fireEvent.touchStart(view, { touches: [{ clientX: 100, clientY: 0 }] });
    fireEvent.touchMove(view, { touches: [{ clientX: 300, clientY: 0 }] });
    fireEvent.touchEnd(view, { changedTouches: [{ clientX: 300, clientY: 0 }] });
    
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
    fireEvent.click(screen.getAllByText(/enero/i)[1]);
    expect(onViewChange).toHaveBeenCalledWith('month');
  });
});
