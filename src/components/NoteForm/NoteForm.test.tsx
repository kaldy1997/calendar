import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NoteForm } from './NoteForm';
import { db } from '../../services/db';

describe('NoteForm', () => {
  beforeEach(async () => {
    await db.reset();
  });

  it('renders correctly in creation mode', () => {
    const mockOnClose = vi.fn();
    render(<NoteForm note={null} onClose={mockOnClose} />);

    expect(screen.getByPlaceholderText('Título')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Empieza a escribir...')).toBeInTheDocument();
    
    // Actions header buttons
    expect(screen.getByTitle('Regresar sin guardar')).toBeInTheDocument();
    expect(screen.getByTitle('Anclar nota')).toBeInTheDocument();
    expect(screen.getByTitle('Guardar nota')).toBeInTheDocument();
  });

  it('handles onClose when clicking back button', () => {
    const mockOnClose = vi.fn();
    render(<NoteForm note={null} onClose={mockOnClose} />);

    const backBtn = screen.getByTitle('Regresar sin guardar');
    fireEvent.click(backBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders existing note for editing', () => {
    const mockOnClose = vi.fn();
    const existingNote = {
      id: 'existing-id',
      title: 'Mi Nota Guardada',
      blocks: [
        { id: 'b1', type: 'text' as const, content: 'Párrafo existente' }
      ],
      color: 'blue',
      labels: ['Personal', 'Idea'],
      isPinned: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    render(<NoteForm note={existingNote} onClose={mockOnClose} />);

    expect(screen.getByDisplayValue('Mi Nota Guardada')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Párrafo existente')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Idea')).toBeInTheDocument();
    expect(screen.getByTitle('Desanclar nota')).toBeInTheDocument();
  });

  it('allows adding tag labels', async () => {
    const mockOnClose = vi.fn();
    render(<NoteForm note={null} onClose={mockOnClose} />);

    const tagInput = screen.getByPlaceholderText('+ Añadir etiqueta');
    fireEvent.change(tagInput, { target: { value: 'NuevaTag' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('NuevaTag')).toBeInTheDocument();
  });

  it('allows adding and writing into different block types', async () => {
    const mockOnClose = vi.fn();
    render(<NoteForm note={null} onClose={mockOnClose} />);

    // Text block is added by default
    const textarea = screen.getByPlaceholderText('Empieza a escribir...');
    fireEvent.change(textarea, { target: { value: 'Hola mundo' } });
    expect(textarea).toHaveValue('Hola mundo');

    // Add Checklist block
    const addChecklistBtn = screen.getByRole('button', { name: /tareas/i });
    fireEvent.click(addChecklistBtn);

    const checklistInput = await screen.findByPlaceholderText('Elemento de lista');
    expect(checklistInput).toBeInTheDocument();
    fireEvent.change(checklistInput, { target: { value: 'Comprar pan' } });
    expect(checklistInput).toHaveValue('Comprar pan');
  });

  it('allows saving notes in the database', async () => {
    const mockOnClose = vi.fn();
    render(<NoteForm note={null} onClose={mockOnClose} />);

    const titleInput = screen.getByPlaceholderText('Título');
    fireEvent.change(titleInput, { target: { value: 'Nota Guardada' } });

    const textarea = screen.getByPlaceholderText('Empieza a escribir...');
    fireEvent.change(textarea, { target: { value: 'Contenido salvado' } });

    const saveBtn = screen.getByTitle('Guardar nota');
    
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    // Wait and verify notes DB write
    await waitFor(async () => {
      const allNotes = await db.notes.toArray();
      expect(allNotes.length).toBe(1);
      expect(allNotes[0].title).toBe('Nota Guardada');
      expect(allNotes[0].blocks[0].content).toBe('Contenido salvado');
    });

    expect(mockOnClose).toHaveBeenCalled();
  });
});
