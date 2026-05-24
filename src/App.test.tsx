import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';
import { db } from './services/db';

describe('App', () => {
  beforeEach(async () => {
    await db.reset();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 4, 15)); // May 15, 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setupRec = async (id: string) => {
    await act(async () => {
      await db.events.bulkAdd([
        { id: id + '1', title: 'Rec', date: '2026-05-15', startTime: '09:00', groupId: id, category: 'work', color: 'blue' },
        { id: id + '2', title: 'Rec', date: '2026-05-16', startTime: '09:00', groupId: id, category: 'work', color: 'blue' },
        { id: id + '3', title: 'Rec', date: '2026-05-17', startTime: '09:00', groupId: id, category: 'work', color: 'blue' },
      ] as any);
    });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
  };

  const clickCalendarDay = async (day: number) => {
    const days = await screen.findAllByTestId(`calendar-day-${day}`);
    // The current active pane is the second one (index 1) in the slider
    await act(async () => {
      fireEvent.click(days[1]);
    });
  };

  it('completes a full lifecycle of interactions', async () => {
    await act(async () => { render(<App />); });

    // 1. Create a single event
    await act(async () => { fireEvent.click(screen.getByTestId('fab-button')); });
    fireEvent.change(screen.getByPlaceholderText(/título del evento/i), { target: { value: 'Single Event' } });
    await act(async () => { fireEvent.click(screen.getByLabelText(/guardar/i)); });
    await waitFor(() => { expect(screen.getByText('Single Event')).toBeInTheDocument(); });

    // 2. Create a recurring event
    await act(async () => { fireEvent.click(screen.getByTestId('fab-button')); });
    fireEvent.change(screen.getByPlaceholderText(/título del evento/i), { target: { value: 'Weekly Series' } });
    fireEvent.change(screen.getByLabelText(/repetir/i), { target: { value: 'weekly' } });
    await act(async () => { fireEvent.click(screen.getByLabelText(/guardar/i)); });
    await waitFor(() => { expect(screen.getAllByText('Weekly Series').length).toBeGreaterThan(0); });

    // 3. Edit single instance of series
    await setupRec('e');
    await clickCalendarDay(15);
    await act(async () => { fireEvent.click((await screen.findAllByText('Rec'))[0]); });
    await act(async () => { fireEvent.click(screen.getByText('Editar')); });
    fireEvent.change(screen.getByPlaceholderText(/título del evento/i), { target: { value: 'Edited Single' } });
    await act(async () => { fireEvent.click(screen.getByLabelText(/guardar/i)); });
    await act(async () => { fireEvent.click(screen.getByText('Solo este evento')); });
    await waitFor(() => { expect(screen.getByTestId('calendar')).toBeInTheDocument(); });

    // 4. Edit future instances
    await setupRec('ef');
    await clickCalendarDay(16);
    await act(async () => { fireEvent.click((await screen.findAllByText('Rec'))[0]); });
    await act(async () => { fireEvent.click(screen.getByText('Editar')); });
    fireEvent.change(screen.getByPlaceholderText(/título del evento/i), { target: { value: 'Edited Future' } });
    await act(async () => { fireEvent.click(screen.getByLabelText(/guardar/i)); });
    await act(async () => { fireEvent.click(screen.getByText('Este y los siguientes')); });
    await waitFor(() => { expect(screen.getByTestId('calendar')).toBeInTheDocument(); });

    // 5. Edit all instances
    await setupRec('ea');
    await clickCalendarDay(15);
    await act(async () => { fireEvent.click((await screen.findAllByText('Rec'))[0]); });
    await act(async () => { fireEvent.click(screen.getByText('Editar')); });
    fireEvent.change(screen.getByPlaceholderText(/título del evento/i), { target: { value: 'Edited All' } });
    await act(async () => { fireEvent.click(screen.getByLabelText(/guardar/i)); });
    await act(async () => { fireEvent.click(screen.getByText('Toda la serie')); });
    await waitFor(() => { expect(screen.getByTestId('calendar')).toBeInTheDocument(); });

    // 6. Delete single
    await setupRec('ds');
    await clickCalendarDay(15);
    await act(async () => { fireEvent.click((await screen.findAllByText('Rec'))[0]); });
    await act(async () => { fireEvent.click(screen.getByText('Eliminar')); });
    await act(async () => { fireEvent.click(screen.getByText('Solo este evento')); });
    await waitFor(() => { expect(screen.getByTestId('calendar')).toBeInTheDocument(); });

    // 7. Delete future
    await setupRec('df');
    await clickCalendarDay(16);
    await act(async () => { fireEvent.click((await screen.findAllByText('Rec'))[0]); });
    await act(async () => { fireEvent.click(screen.getByText('Eliminar')); });
    await act(async () => { fireEvent.click(screen.getByText('Este y los siguientes')); });
    await waitFor(() => { expect(screen.getByTestId('calendar')).toBeInTheDocument(); });

    // 8. Delete all
    await setupRec('da');
    await clickCalendarDay(15);
    await act(async () => { fireEvent.click((await screen.findAllByText('Rec'))[0]); });
    await act(async () => { fireEvent.click(screen.getByText('Eliminar')); });
    await act(async () => { fireEvent.click(screen.getByText('Toda la serie')); });
    await waitFor(() => { expect(screen.getByTestId('calendar')).toBeInTheDocument(); });

    // 9. Cancels
    await act(async () => { fireEvent.click(screen.getByTestId('view-selector-calendar-tab')); });
    await act(async () => { fireEvent.click(screen.getByTestId('view-selector-week')); });
    await act(async () => { fireEvent.click(screen.getByTestId('view-selector-calendar-tab')); });
    await act(async () => { fireEvent.click(screen.getByTestId('view-selector-year')); });
    await act(async () => { fireEvent.click(screen.getAllByText(/enero/i)[1]); }); // YearView navigation
  });
});
