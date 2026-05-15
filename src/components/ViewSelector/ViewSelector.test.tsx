import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewSelector from './ViewSelector';

describe('ViewSelector', () => {
  it('renders correctly', () => {
    render(<ViewSelector currentView="month" onChange={() => {}} />);
    expect(screen.getByTestId('view-selector-month')).toBeInTheDocument();
    expect(screen.getByTestId('view-selector-year')).toBeInTheDocument();
    expect(screen.getByTestId('view-selector-week')).toBeInTheDocument();
  });

  it('marks current view as active', () => {
    render(<ViewSelector currentView="month" onChange={() => {}} />);
    expect(screen.getByTestId('view-selector-month')).toHaveClass('view-selector__btn--active');
    expect(screen.getByTestId('view-selector-year')).not.toHaveClass('view-selector__btn--active');
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<ViewSelector currentView="month" onChange={handleChange} />);
    fireEvent.click(screen.getByTestId('view-selector-year'));
    expect(handleChange).toHaveBeenCalledWith('year');
  });
});
