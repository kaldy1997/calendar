import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Fab from './Fab';

describe('Fab', () => {
  it('renders correctly', () => {
    render(<Fab onClick={() => {}} />);
    expect(screen.getByTestId('fab-button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Fab onClick={handleClick} />);
    fireEvent.click(screen.getByTestId('fab-button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
