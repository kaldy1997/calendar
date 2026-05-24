import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewSelector from './ViewSelector';

describe('ViewSelector', () => {
  it('renders tabs correctly', () => {
    render(<ViewSelector currentView="calendar" currentViewMode="month" onNavigate={() => {}} />);
    expect(screen.getByTestId('view-selector-calendar-tab')).toBeInTheDocument();
    expect(screen.getByTestId('view-selector-clock-tab')).toBeInTheDocument();
  });

  it('opens calendar submenu on click and displays options', () => {
    render(<ViewSelector currentView="calendar" currentViewMode="month" onNavigate={() => {}} />);
    
    // Click calendar tab to open submenu
    fireEvent.click(screen.getByTestId('view-selector-calendar-tab'));
    
    expect(screen.getByTestId('view-selector-year')).toBeInTheDocument();
    expect(screen.getByTestId('view-selector-month')).toBeInTheDocument();
    expect(screen.getByTestId('view-selector-week')).toBeInTheDocument();
  });

  it('calls onNavigate with calendar and correct mode when submenu item clicked', () => {
    const handleNavigate = vi.fn();
    render(<ViewSelector currentView="calendar" currentViewMode="month" onNavigate={handleNavigate} />);
    
    fireEvent.click(screen.getByTestId('view-selector-calendar-tab'));
    fireEvent.click(screen.getByTestId('view-selector-year'));
    
    expect(handleNavigate).toHaveBeenCalledWith('calendar', 'year');
  });

  it('opens clock submenu on click and displays options without auto-navigating', () => {
    const handleNavigate = vi.fn();
    render(<ViewSelector currentView="calendar" currentViewMode="month" onNavigate={handleNavigate} />);
    
    // Clicking clock tab should only open clock submenu, NOT trigger navigation
    fireEvent.click(screen.getByTestId('view-selector-clock-tab'));
    
    expect(handleNavigate).not.toHaveBeenCalled();
    expect(screen.getByTestId('view-selector-alarms')).toBeInTheDocument();
    expect(screen.getByTestId('view-selector-timers')).toBeInTheDocument();

    // Clicking alarms option inside submenu triggers navigation
    fireEvent.click(screen.getByTestId('view-selector-alarms'));
    expect(handleNavigate).toHaveBeenCalledWith('alarms');
  });
});
