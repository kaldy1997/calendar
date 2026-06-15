import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NotesView } from './NotesView';
import { db } from '../../services/db';

describe('NotesView', () => {
  beforeEach(async () => {
    await db.reset();
  });

  it('renders empty state when there are no notes', async () => {
    const mockOnAdd = vi.fn();
    const mockOnEdit = vi.fn();

    render(<NotesView onAddNote={mockOnAdd} onEditNote={mockOnEdit} />);

    expect(screen.getByText('Aún no tienes notas')).toBeInTheDocument();
    
    const createBtn = screen.getByRole('button', { name: 'Crear Nota' });
    fireEvent.click(createBtn);
    expect(mockOnAdd).toHaveBeenCalled();
  });

  it('renders the list of notes and responds to clicking a note', async () => {
    const mockOnAdd = vi.fn();
    const mockOnEdit = vi.fn();

    const testNote = {
      id: 'note-1',
      title: 'Nota de Prueba',
      blocks: [{ id: 'b1', type: 'text' as const, content: 'Contenido de prueba' }],
      color: 'charcoal',
      labels: ['Trabajo'],
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await act(async () => {
      await db.notes.add(testNote);
    });

    render(<NotesView onAddNote={mockOnAdd} onEditNote={mockOnEdit} />);

    // Wait for Dexie to query and re-render
    await waitFor(() => {
      expect(screen.getByText('Nota de Prueba')).toBeInTheDocument();
    });

    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
    expect(screen.getAllByText('Trabajo').length).toBeGreaterThan(0);

    const noteCard = screen.getByText('Nota de Prueba').closest('.note-card');
    expect(noteCard).toBeInTheDocument();

    if (noteCard) {
      fireEvent.click(noteCard);
      expect(mockOnEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'note-1' }));
    }
  });

  it('separates pinned and unpinned notes correctly', async () => {
    const notes = [
      {
        id: 'n1',
        title: 'Normal Note',
        blocks: [{ id: 'b1', type: 'text' as const, content: 'Unpinned content' }],
        color: 'blue',
        labels: [],
        isPinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'n2',
        title: 'Pinned Note',
        blocks: [{ id: 'b2', type: 'text' as const, content: 'Pinned content' }],
        color: 'emerald',
        labels: [],
        isPinned: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    await act(async () => {
      await db.notes.bulkAdd(notes);
    });

    render(<NotesView onAddNote={vi.fn()} onEditNote={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Normal Note')).toBeInTheDocument();
      expect(screen.getByText('Pinned Note')).toBeInTheDocument();
    });

    expect(screen.getByText('Ancladas')).toBeInTheDocument();
    expect(screen.getByText('Otras notas')).toBeInTheDocument();
  });

  it('filters notes by search query', async () => {
    const notes = [
      {
        id: 'n1',
        title: 'Manzanas',
        blocks: [{ id: 'b1', type: 'text' as const, content: 'Comprar fruta' }],
        color: 'amber',
        labels: [],
        isPinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'n2',
        title: 'Reunión',
        blocks: [{ id: 'b2', type: 'text' as const, content: 'Llamar a Juan' }],
        color: 'purple',
        labels: [],
        isPinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    await act(async () => {
      await db.notes.bulkAdd(notes);
    });

    render(<NotesView onAddNote={vi.fn()} onEditNote={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Manzanas')).toBeInTheDocument();
      expect(screen.getByText('Reunión')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por título o contenido...');
    
    // Search for "Juan"
    fireEvent.change(searchInput, { target: { value: 'Juan' } });

    await waitFor(() => {
      expect(screen.queryByText('Manzanas')).not.toBeInTheDocument();
      expect(screen.getByText('Reunión')).toBeInTheDocument();
    });
  });

  it('filters notes by selected label tag', async () => {
    const notes = [
      {
        id: 'n1',
        title: 'Nota Personal',
        blocks: [{ id: 'b1', type: 'text' as const, content: 'Contenido personal' }],
        color: 'blue',
        labels: ['Personal'],
        isPinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'n2',
        title: 'Nota de Trabajo',
        blocks: [{ id: 'b2', type: 'text' as const, content: 'Contenido de trabajo' }],
        color: 'rose',
        labels: ['Trabajo'],
        isPinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    await act(async () => {
      await db.notes.bulkAdd(notes);
    });

    render(<NotesView onAddNote={vi.fn()} onEditNote={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Nota Personal')).toBeInTheDocument();
      expect(screen.getByText('Nota de Trabajo')).toBeInTheDocument();
    });

    const labelTab = screen.getByRole('tab', { name: 'Personal' });
    fireEvent.click(labelTab);

    await waitFor(() => {
      expect(screen.getByText('Nota Personal')).toBeInTheDocument();
      expect(screen.queryByText('Nota de Trabajo')).not.toBeInTheDocument();
    });
  });

  it('allows pinning and unpinning notes via cards', async () => {
    const testNote = {
      id: 'note-pinned-test',
      title: 'Nota de Pin',
      blocks: [{ id: 'b1', type: 'text' as const, content: 'Test Pin' }],
      color: 'charcoal',
      labels: [],
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await act(async () => {
      await db.notes.add(testNote);
    });

    render(<NotesView onAddNote={vi.fn()} onEditNote={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Nota de Pin')).toBeInTheDocument();
    });

    // Check if the pin button is present
    const pinBtn = screen.getByTitle('Anclar nota');
    expect(pinBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(pinBtn);
    });

    // Pinned notes section should now appear and note should be in it
    await waitFor(async () => {
      const updatedNote = await db.notes.get('note-pinned-test');
      expect(updatedNote?.isPinned).toBe(true);
    });
  });

  it('allows deleting a note after confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    const testNote = {
      id: 'note-delete-test',
      title: 'Nota Borrable',
      blocks: [{ id: 'b1', type: 'text' as const, content: 'Bórrame' }],
      color: 'charcoal',
      labels: [],
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await act(async () => {
      await db.notes.add(testNote);
    });

    render(<NotesView onAddNote={vi.fn()} onEditNote={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Nota Borrable')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByTitle('Eliminar nota');
    expect(deleteBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    expect(confirmSpy).toHaveBeenCalled();

    await waitFor(async () => {
      const remainingNote = await db.notes.get('note-delete-test');
      expect(remainingNote).toBeUndefined();
    });

    confirmSpy.mockRestore();
  });
});
