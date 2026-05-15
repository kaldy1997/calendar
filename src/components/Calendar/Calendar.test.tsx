import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Calendar from './Calendar';

describe('Calendar', () => {
  it('renders the calendar component with month name', () => {
    render(<Calendar />);
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
    // In May 2026, it should show "mayo de 2026" (or similar depending on date)
    expect(screen.getByTestId('calendar-today-btn')).toBeInTheDocument();
  });

  it('renders MonthView by default', () => {
    render(<Calendar viewMode="month" />);
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('renders YearView and placeholders', () => {
    const { rerender } = render(<Calendar viewMode="year" />);
    expect(screen.getByTestId('year-view')).toBeInTheDocument();

    rerender(<Calendar viewMode="week" />);
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });
});
