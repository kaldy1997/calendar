import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import YearView from './YearView';

describe('YearView', () => {
  const mockDate = new Date(2026, 0, 1);

  it('renders 12 months', () => {
    render(<YearView currentDate={mockDate} onMonthSelect={() => {}} onNavigate={() => {}} />);
    // There should be 12 month titles
    const monthTitles = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    monthTitles.forEach(title => {
      expect(screen.getByText(new RegExp(title, 'i'))).toBeInTheDocument();
    });
  });

  it('calls onMonthSelect when a month is clicked', () => {
    const onMonthSelect = vi.fn();
    render(<YearView currentDate={mockDate} onMonthSelect={onMonthSelect} onNavigate={() => {}} />);
    
    const firstMonth = screen.getByText(/enero/i);
    fireEvent.click(firstMonth);
    
    expect(onMonthSelect).toHaveBeenCalledWith(0);
  });

  it('calls onNavigate when swiped', () => {
    const onNavigate = vi.fn();
    render(<YearView currentDate={mockDate} onMonthSelect={() => {}} onNavigate={onNavigate} />);
    
    const yearView = screen.getByTestId('year-view');
    
    // Swipe left (next year)
    fireEvent.touchStart(yearView, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(yearView, { changedTouches: [{ clientX: 100 }] });
    
    expect(onNavigate).toHaveBeenCalledWith(12);
  });

  it('highlights weekends in blue', () => {
    render(<YearView currentDate={mockDate} onMonthSelect={() => {}} onNavigate={() => {}} />);
    // Check if some days have the weekend class
    const weekendDays = document.querySelectorAll('.mini-month__day--weekend');
    expect(weekendDays.length).toBeGreaterThan(0);
  });
});
