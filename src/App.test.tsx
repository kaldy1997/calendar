import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the calendar view initially', () => {
    render(<App />);
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
    expect(screen.getByTestId('fab-button')).toBeInTheDocument();
    expect(screen.getByTestId('view-selector-month')).toBeInTheDocument();
  });

  it('navigates to day detail when a day is clicked', () => {
    render(<App />);
    const dayButtons = screen.getAllByTestId('calendar-day-15');
    fireEvent.click(dayButtons[0]);

    expect(screen.getByTestId('day-detail')).toBeInTheDocument();
    expect(screen.queryByTestId('calendar')).not.toBeInTheDocument();
  });

  it('navigates back to calendar from day detail', () => {
    render(<App />);
    // Go to detail
    const dayButtons = screen.getAllByTestId('calendar-day-15');
    fireEvent.click(dayButtons[0]);
    
    // Go back
    fireEvent.click(screen.getByLabelText(/volver/i));

    expect(screen.getByTestId('calendar')).toBeInTheDocument();
    expect(screen.queryByTestId('day-detail')).not.toBeInTheDocument();
  });

  it('keeps FAB visible in both views', () => {
    render(<App />);
    expect(screen.getByTestId('fab-button')).toBeInTheDocument();
    
    const dayButtons = screen.getAllByTestId('calendar-day-15');
    fireEvent.click(dayButtons[0]);
    
    expect(screen.getByTestId('fab-button')).toBeInTheDocument();
  });
});
