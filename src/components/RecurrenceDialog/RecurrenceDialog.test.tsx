import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecurrenceDialog from './RecurrenceDialog';

describe('RecurrenceDialog', () => {
  const mockProps = {
    title: 'Prueba de Título',
    onSelect: vi.fn(),
    onCancel: vi.fn()
  };

  it('renders correctly', () => {
    render(<RecurrenceDialog {...mockProps} />);
    expect(screen.getByText('Prueba de Título')).toBeInTheDocument();
    expect(screen.getByText(/este evento es parte de una serie/i)).toBeInTheDocument();
    expect(screen.getByText('Solo este evento')).toBeInTheDocument();
    expect(screen.getByText('Este y los siguientes')).toBeInTheDocument();
    expect(screen.getByText('Toda la serie')).toBeInTheDocument();
  });

  it('calls onSelect with "single" when clicking first option', () => {
    render(<RecurrenceDialog {...mockProps} />);
    fireEvent.click(screen.getByText('Solo este evento'));
    expect(mockProps.onSelect).toHaveBeenCalledWith('single');
  });

  it('calls onSelect with "future" when clicking second option', () => {
    render(<RecurrenceDialog {...mockProps} />);
    fireEvent.click(screen.getByText('Este y los siguientes'));
    expect(mockProps.onSelect).toHaveBeenCalledWith('future');
  });

  it('calls onSelect with "all" when clicking third option', () => {
    render(<RecurrenceDialog {...mockProps} />);
    fireEvent.click(screen.getByText('Toda la serie'));
    expect(mockProps.onSelect).toHaveBeenCalledWith('all');
  });

  it('calls onCancel when clicking cancel button', () => {
    render(<RecurrenceDialog {...mockProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('calls onCancel when clicking overlay', () => {
    const { container } = render(<RecurrenceDialog {...mockProps} />);
    const overlay = container.firstChild as HTMLElement;
    fireEvent.click(overlay);
    expect(mockProps.onCancel).toHaveBeenCalled();
  });
});
