import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import type { Note, NoteBlock } from '../../types/types';
import { Fab } from '../Fab';
import './NotesView.scss';

import searchIcon from '../../assets/icons/search.svg?raw';
import pinIcon from '../../assets/icons/pin.svg?raw';
import pinFilledIcon from '../../assets/icons/pin-filled.svg?raw';
import trashIcon from '../../assets/icons/trash.svg?raw';
import plusIcon from '../../assets/icons/plus.svg?raw';
import checkIcon from '../../assets/icons/check.svg?raw';
import checkboxUncheckedIcon from '../../assets/icons/checkbox-unchecked.svg?raw';

// SVG Icons loaded dynamically
const icons = {
  search: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: searchIcon }} />,
  pin: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: pinIcon }} />,
  pinFilled: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: pinFilledIcon }} />,
  trash: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: trashIcon }} />,
  plus: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: plusIcon }} />,
  checkboxChecked: <span className="icon-svg note-card__todo-icon checked" dangerouslySetInnerHTML={{ __html: checkIcon }} />,
  checkboxUnchecked: <span className="icon-svg note-card__todo-icon unchecked" dangerouslySetInnerHTML={{ __html: checkboxUncheckedIcon }} />
};

interface NotesViewProps {
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
}

export function NotesView({ onAddNote, onEditNote }: NotesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>('Todas');
  const layout = 'grid';

  // Load notes from DB
  const notes = useLiveQuery(() => db.notes.toArray()) || [];

  // Deduplicate and gather all labels
  const allLabels = useMemo(() => {
    const labelsSet = new Set<string>();
    notes.forEach((note) => {
      note.labels?.forEach((lbl) => {
        if (lbl.trim() !== '') {
          labelsSet.add(lbl);
        }
      });
    });
    return ['Todas', ...Array.from(labelsSet).sort()];
  }, [notes]);

  // Handle Note Deletion
  const handleDeleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
      await db.notes.delete(id);
    }
  };

  // Handle Note Pin Toggle
  const handleTogglePin = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    await db.notes.update(note.id, { isPinned: !note.isPinned });
  };

  // Filter notes by search query and label selection
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // 1. Label filter
      if (selectedLabel !== 'Todas' && !note.labels?.includes(selectedLabel)) {
        return false;
      }
      // 2. Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesContent = note.blocks.some((block) => {
          if (block.content && block.content.toLowerCase().includes(query)) {
            return true;
          }
          if (block.todoItems && block.todoItems.some(item => item.text.toLowerCase().includes(query))) {
            return true;
          }
          if (block.listItems && block.listItems.some(item => item.toLowerCase().includes(query))) {
            return true;
          }
          if (block.tableData?.rows && block.tableData.rows.some(row => row.some(cell => cell.toLowerCase().includes(query)))) {
            return true;
          }
          return false;
        });
        return matchesTitle || matchesContent;
      }
      return true;
    });
  }, [notes, selectedLabel, searchQuery]);

  // Separate Pinned and Others
  const { pinnedNotes, otherNotes } = useMemo(() => {
    const pinned = filteredNotes.filter(n => n.isPinned);
    const others = filteredNotes.filter(n => !n.isPinned);
    // Sort by updated time (descending)
    pinned.sort((a, b) => b.updatedAt - a.updatedAt);
    others.sort((a, b) => b.updatedAt - a.updatedAt);
    return { pinnedNotes: pinned, otherNotes: others };
  }, [filteredNotes]);

  // Helper to render preview of note blocks
  const renderBlockPreview = (block: NoteBlock) => {
    switch (block.type) {
      case 'text':
        if (!block.content) return null;
        return (
          <p key={block.id} className="note-card__preview-text">
            {block.content.length > 80 ? `${block.content.substring(0, 80)}...` : block.content}
          </p>
        );
      case 'todo':
        if (!block.todoItems || block.todoItems.length === 0) return null;
        const totalItems = block.todoItems.length;
        const completedItems = block.todoItems.filter(item => item.done).length;
        const percent = Math.round((completedItems / totalItems) * 100);
        return (
          <div key={block.id} className="note-card__preview-todo">
            <div className="note-card__todo-summary">
              <span className="note-card__todo-count">{completedItems}/{totalItems} tareas</span>
              <div className="note-card__todo-progress-bg">
                <div className="note-card__todo-progress-bar" style={{ width: `${percent}%` }} />
              </div>
            </div>
            <ul className="note-card__todo-list">
              {block.todoItems.slice(0, 2).map((item) => (
                <li key={item.id} className={`note-card__todo-item ${item.done ? 'done' : ''}`}>
                  {item.done ? icons.checkboxChecked : icons.checkboxUnchecked}
                  <span className="note-card__todo-text">{item.text || 'Sin texto'}</span>
                </li>
              ))}
              {totalItems > 2 && <li className="note-card__todo-more">+{totalItems - 2} más...</li>}
            </ul>
          </div>
        );
      case 'numbered':
        if (!block.listItems || block.listItems.length === 0) return null;
        return (
          <ol key={block.id} className="note-card__preview-numbered">
            {block.listItems.slice(0, 2).map((item, index) => (
              <li key={index} className="note-card__numbered-item">
                <span className="note-card__numbered-num">{index + 1}.</span>
                <span className="note-card__numbered-text">{item || 'Sin texto'}</span>
              </li>
            ))}
            {block.listItems.length > 2 && (
              <li className="note-card__numbered-more">+{block.listItems.length - 2} más...</li>
            )}
          </ol>
        );
      case 'table':
        if (!block.tableData || !block.tableData.rows || block.tableData.rows.length === 0) return null;
        const rowsCount = block.tableData.rows.length;
        const colsCount = block.tableData.rows[0].length;
        return (
          <div key={block.id} className="note-card__preview-table">
            <span className="note-card__table-summary">
              Tabla ({rowsCount} x {colsCount})
            </span>
            <div className="note-card__table-grid">
              {block.tableData.rows.slice(0, 2).map((row, rIdx) => (
                <div key={rIdx} className="note-card__table-row">
                  {row.slice(0, 3).map((cell, cIdx) => (
                    <div key={cIdx} className="note-card__table-cell">
                      {cell || '...'}
                    </div>
                  ))}
                  {row.length > 3 && <div className="note-card__table-cell more">...</div>}
                </div>
              ))}
              {rowsCount > 2 && <div className="note-card__table-more">+{rowsCount - 2} filas más...</div>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="notes-view">
      {/* Header bar */}
      <header className="notes-view__header">
        <h1 className="notes-view__title">Mis Notas</h1>
      </header>

      {/* Search and Filters */}
      <div className="notes-view__search-filters">
        <div className="notes-view__search-wrapper">
          <span className="notes-view__search-icon">{icons.search}</span>
          <input
            type="text"
            className="notes-view__search-input"
            placeholder="Buscar por título o contenido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="notes-search-input"
          />
          {searchQuery && (
            <button
              className="notes-view__clear-search"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        {/* Labels dynamic carousel */}
        <div className="notes-view__labels-carousel" role="tablist" aria-label="Filtrar por etiqueta">
          {allLabels.map((label) => (
            <button
              key={label}
              className={`notes-view__label-tab ${selectedLabel === label ? 'active' : ''}`}
              onClick={() => setSelectedLabel(label)}
              role="tab"
              aria-selected={selectedLabel === label}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Container */}
      <div className={`notes-view__content ${layout}`}>
        {notes.length === 0 ? (
          <div className="notes-view__empty">No tienes notas guardadas</div>
        ) : filteredNotes.length === 0 ? (
          <div className="notes-view__empty">No se encontraron notas</div>
        ) : (
          <>
            {/* Pinned notes section */}
            {pinnedNotes.length > 0 && (
              <section className="notes-view__section pinned">
                <h3 className="notes-view__section-title">
                  <span>{icons.pinFilled}</span> Ancladas
                </h3>
                <div className={`notes-view__grid`}>
                  {pinnedNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`note-card note-card--${note.color}`}
                      onClick={() => onEditNote(note)}
                    >
                      <button
                        className="note-card__pin active"
                        onClick={(e) => handleTogglePin(e, note)}
                        title="Desanclar nota"
                      >
                        {icons.pinFilled}
                      </button>
                      <button
                        className="note-card__delete"
                        onClick={(e) => handleDeleteNote(e, note.id)}
                        title="Eliminar nota"
                      >
                        {icons.trash}
                      </button>

                      <h4 className="note-card__title">{note.title || 'Sin título'}</h4>

                      <div className="note-card__body">
                        {note.blocks.slice(0, 3).map((block) => renderBlockPreview(block))}
                      </div>

                      {note.labels && note.labels.length > 0 && (
                        <div className="note-card__labels">
                          {note.labels.map((lbl) => (
                            <span key={lbl} className="note-card__label-badge">{lbl}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Other notes section */}
            {otherNotes.length > 0 && (
              <section className="notes-view__section others">
                {pinnedNotes.length > 0 && (
                  <h3 className="notes-view__section-title">Otras notas</h3>
                )}
                <div className={`notes-view__grid`}>
                  {otherNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`note-card note-card--${note.color}`}
                      onClick={() => onEditNote(note)}
                    >
                      <button
                        className="note-card__pin"
                        onClick={(e) => handleTogglePin(e, note)}
                        title="Anclar nota"
                      >
                        {icons.pin}
                      </button>
                      <button
                        className="note-card__delete"
                        onClick={(e) => handleDeleteNote(e, note.id)}
                        title="Eliminar nota"
                      >
                        {icons.trash}
                      </button>

                      <h4 className="note-card__title">{note.title || 'Sin título'}</h4>

                      <div className="note-card__body">
                        {note.blocks.slice(0, 3).map((block) => renderBlockPreview(block))}
                      </div>

                      {note.labels && note.labels.length > 0 && (
                        <div className="note-card__labels">
                          {note.labels.map((lbl) => (
                            <span key={lbl} className="note-card__label-badge">{lbl}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Float Action Button to add notes */}
      <Fab
        onClick={onAddNote}
        aria-label="Crear nueva nota"
      />
    </div>
  );
}
