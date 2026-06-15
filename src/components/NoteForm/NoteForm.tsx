import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { db } from '../../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Note, NoteBlock, NoteBlockType } from '../../types/types';
import './NoteForm.scss';

import backIcon from '../../assets/icons/back.svg?raw';
import checkIcon from '../../assets/icons/check.svg?raw';
import pinIcon from '../../assets/icons/pin.svg?raw';
import pinFilledIcon from '../../assets/icons/pin-filled.svg?raw';
import arrowUpIcon from '../../assets/icons/arrow-up.svg?raw';
import arrowDownIcon from '../../assets/icons/arrow-down.svg?raw';
import trashIcon from '../../assets/icons/trash.svg?raw';
import plusIcon from '../../assets/icons/plus.svg?raw';
import checkboxUncheckedIcon from '../../assets/icons/checkbox-unchecked.svg?raw';
import textBlockIcon from '../../assets/icons/text-block.svg?raw';
import todoBlockIcon from '../../assets/icons/todo-block.svg?raw';
import listBlockIcon from '../../assets/icons/list-block.svg?raw';
import tableBlockIcon from '../../assets/icons/table-block.svg?raw';

// SVG Icons loaded dynamically
const icons = {
  back: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: backIcon }} />,
  save: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: checkIcon }} />,
  pin: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: pinIcon }} />,
  pinFilled: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: pinFilledIcon }} />,
  up: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: arrowUpIcon }} />,
  down: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: arrowDownIcon }} />,
  trash: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: trashIcon }} />,
  plus: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: plusIcon }} />,
  checkboxChecked: <span className="icon-svg todo-item-check-btn checked" dangerouslySetInnerHTML={{ __html: checkIcon }} />,
  checkboxUnchecked: <span className="icon-svg todo-item-check-btn unchecked" dangerouslySetInnerHTML={{ __html: checkboxUncheckedIcon }} />,
  textBlock: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: textBlockIcon }} />,
  todoBlock: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: todoBlockIcon }} />,
  listBlock: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: listBlockIcon }} />,
  tableBlock: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: tableBlockIcon }} />,
  addColumn: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: plusIcon }} />,
  addRow: <span className="icon-svg" dangerouslySetInnerHTML={{ __html: plusIcon }} />
};

const COLOR_PRESETS = [
  { id: 'charcoal', name: 'Carbón', value: '#22222e' },
  { id: 'purple', name: 'Púrpura', value: '#7c5cfc' },
  { id: 'blue', name: 'Azul', value: '#3b82f6' },
  { id: 'emerald', name: 'Verde', value: '#10b981' },
  { id: 'amber', name: 'Ámbar', value: '#f59e0b' },
  { id: 'rose', name: 'Rosa', value: '#ec4899' }
];

interface NoteFormProps {
  note: Note | null;
  onClose: () => void;
}

export function NoteForm({ note, onClose }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [blocks, setBlocks] = useState<NoteBlock[]>(note?.blocks || []);
  const [color, setColor] = useState(note?.color || 'charcoal');
  const [labels, setLabels] = useState<string[]>(note?.labels || []);
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea heights dynamically when blocks change (wrapping/typing/mount)
  useLayoutEffect(() => {
    if (containerRef.current) {
      const textareas = containerRef.current.querySelectorAll('.note-form__textarea');
      textareas.forEach((el) => {
        const textarea = el as HTMLTextAreaElement;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      });
    }
  }, [blocks]);

  // Load existing notes to get autocomplete labels
  const existingNotes = useLiveQuery(() => db.notes.toArray()) || [];
  const autocompleteLabels = useMemo(() => {
    const set = new Set<string>();
    existingNotes.forEach(n => {
      n.labels?.forEach(lbl => {
        if (!labels.includes(lbl) && lbl.toLowerCase().includes(newTagInput.toLowerCase())) {
          set.add(lbl);
        }
      });
    });
    return Array.from(set).sort();
  }, [existingNotes, labels, newTagInput]);

  // Add default block if empty
  useEffect(() => {
    if (blocks.length === 0) {
      setBlocks([
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'text',
          content: ''
        }
      ]);
    }
  }, [blocks]);

  // Utility to generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 11);

  // Block Manipulation
  const addBlock = (type: NoteBlockType) => {
    const newBlock: NoteBlock = {
      id: generateId(),
      type,
      content: ''
    };

    if (type === 'todo') {
      newBlock.todoItems = [{ id: generateId(), text: '', done: false }];
    } else if (type === 'numbered') {
      newBlock.listItems = [''];
    } else if (type === 'table') {
      newBlock.tableData = {
        rows: [
          ['', ''],
          ['', '']
        ]
      };
    }

    setBlocks(prev => [...prev, newBlock]);
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    setBlocks(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Content Updates
  const updateTextBlock = (blockId: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content } : b));
  };

  // Todo Items Updates
  const updateTodoItem = (blockId: string, itemId: string, text: string, done: boolean) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId && b.todoItems) {
        return {
          ...b,
          todoItems: b.todoItems.map(item => item.id === itemId ? { ...item, text, done } : item)
        };
      }
      return b;
    }));
  };

  const addTodoItem = (blockId: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId && b.todoItems) {
        return {
          ...b,
          todoItems: [...b.todoItems, { id: generateId(), text: '', done: false }]
        };
      }
      return b;
    }));
  };

  const deleteTodoItem = (blockId: string, itemId: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId && b.todoItems) {
        // Keep at least one item
        if (b.todoItems.length <= 1) {
          return {
            ...b,
            todoItems: [{ id: generateId(), text: '', done: false }]
          };
        }
        return {
          ...b,
          todoItems: b.todoItems.filter(item => item.id !== itemId)
        };
      }
      return b;
    }));
  };

  // Numbered List Updates
  const updateListItem = (blockId: string, itemIdx: number, val: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId && b.listItems) {
        const copy = [...b.listItems];
        copy[itemIdx] = val;
        return { ...b, listItems: copy };
      }
      return b;
    }));
  };

  const addListItem = (blockId: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId && b.listItems) {
        return { ...b, listItems: [...b.listItems, ''] };
      }
      return b;
    }));
  };

  const deleteListItem = (blockId: string, itemIdx: number) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId && b.listItems) {
        if (b.listItems.length <= 1) {
          return { ...b, listItems: [''] };
        }
        return {
          ...b,
          listItems: b.listItems.filter((_, idx) => idx !== itemIdx)
        };
      }
      return b;
    }));
  };

  // Table Updates
  const updateTableCell = (blockId: string, rIdx: number, cIdx: number, val: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId && b.tableData) {
        const newRows = b.tableData.rows.map((row, r) => {
          if (r === rIdx) {
            return row.map((cell, c) => c === cIdx ? val : cell);
          }
          return row;
        });
        return { ...b, tableData: { rows: newRows } };
      }
      return b;
    }));
  };

  const addTableRow = (blockId: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId && b.tableData) {
        const colsCount = b.tableData.rows[0].length;
        const newRow = Array(colsCount).fill('');
        return {
          ...b,
          tableData: { rows: [...b.tableData.rows, newRow] }
        };
      }
      return b;
    }));
  };

  const deleteTableRow = (blockId: string, rIdx: number) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId && b.tableData) {
        if (b.tableData.rows.length <= 1) return b; // Keep at least 1 row
        return {
          ...b,
          tableData: { rows: b.tableData.rows.filter((_, r) => r !== rIdx) }
        };
      }
      return b;
    }));
  };

  const addTableColumn = (blockId: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId && b.tableData) {
        const newRows = b.tableData.rows.map(row => [...row, '']);
        return {
          ...b,
          tableData: { rows: newRows }
        };
      }
      return b;
    }));
  };

  const deleteTableColumn = (blockId: string, cIdx: number) => {
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId && b.tableData) {
        const colsCount = b.tableData.rows[0].length;
        if (colsCount <= 1) return b; // Keep at least 1 col
        const newRows = b.tableData.rows.map(row => row.filter((_, c) => c !== cIdx));
        return {
          ...b,
          tableData: { rows: newRows }
        };
      }
      return b;
    }));
  };

  // Tags Management
  const handleAddTag = (tag: string) => {
    const cleanTag = tag.trim();
    if (cleanTag && !labels.includes(cleanTag)) {
      setLabels(prev => [...prev, cleanTag]);
    }
    setNewTagInput('');
    setShowTagDropdown(false);
  };

  const handleRemoveTag = (tag: string) => {
    setLabels(prev => prev.filter(t => t !== tag));
  };

  // Saving Note
  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const cleanBlocks = blocks.filter(b => {
      if (b.type === 'text' && !b.content.trim()) return false;
      return true;
    });

    if (!trimmedTitle && cleanBlocks.length === 0) {
      alert('Por favor, escribe un título o añade algún contenido.');
      return;
    }

    const noteId = note?.id || generateId();
    const now = Date.now();
    const savedNote: Note = {
      id: noteId,
      title: trimmedTitle || 'Nota sin título',
      blocks: blocks,
      color,
      labels,
      isPinned,
      createdAt: note?.createdAt || now,
      updatedAt: now
    };

    await db.notes.put(savedNote);
    onClose();
  };

  return (
    <div ref={containerRef} className={`note-form note-form--${color}`}>
      {/* Navigation Top Bar */}
      <header className="note-form__header">
        <button 
          className="note-form__header-btn" 
          onClick={onClose}
          title="Regresar sin guardar"
        >
          {icons.back}
        </button>

        <div className="note-form__header-right">
          <button 
            className={`note-form__header-btn pin-btn ${isPinned ? 'active' : ''}`}
            onClick={() => setIsPinned(p => !p)}
            title={isPinned ? 'Desanclar nota' : 'Anclar nota'}
          >
            {isPinned ? icons.pinFilled : icons.pin}
          </button>
          
          <button 
            className="note-form__header-btn save-btn"
            onClick={handleSave}
            title="Guardar nota"
          >
            {icons.save} <span>Guardar</span>
          </button>
        </div>
      </header>

      {/* Main Form Fields */}
      <div className="note-form__scroll-container">
        
        {/* Title Input */}
        <input 
          type="text"
          className="note-form__title-input"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          id="note-title-field"
        />

        {/* Color Presets Picker */}
        <div className="note-form__color-picker" aria-label="Elegir color de nota">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={`note-form__color-dot note-form__color-dot--${preset.id} ${color === preset.id ? 'selected' : ''}`}
              onClick={() => setColor(preset.id)}
              title={preset.name}
              style={{ backgroundColor: preset.value }}
              aria-label={`Color ${preset.name}`}
            />
          ))}
        </div>

        {/* Labels / Tags Manager */}
        <div className="note-form__tags-manager">
          <div className="note-form__tag-list">
            {labels.map((lbl) => (
              <span key={lbl} className="note-form__tag-badge">
                {lbl}
                <button 
                  type="button" 
                  className="note-form__remove-tag-btn"
                  onClick={() => handleRemoveTag(lbl)}
                  title={`Quitar etiqueta ${lbl}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="note-form__add-tag-wrapper">
            <input 
              type="text"
              className="note-form__tag-input"
              placeholder="+ Añadir etiqueta"
              value={newTagInput}
              onChange={(e) => {
                setNewTagInput(e.target.value);
                setShowTagDropdown(true);
              }}
              onFocus={() => setShowTagDropdown(true)}
              onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)} // Delay for click handling
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(newTagInput);
                }
              }}
            />
            {showTagDropdown && autocompleteLabels.length > 0 && (
              <ul className="note-form__tag-dropdown">
                {autocompleteLabels.map(lbl => (
                  <li 
                    key={lbl} 
                    onMouseDown={() => handleAddTag(lbl)}
                    className="note-form__tag-dropdown-item"
                  >
                    {lbl}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Blocks Area */}
        <div className="note-form__blocks-list">
          {blocks.map((block, index) => (
            <div key={block.id} className="note-form__block-container">
              {/* Block Side Toolbar */}
              <div className="note-form__block-toolbar">
                <button 
                  className="note-form__block-action-btn"
                  onClick={() => moveBlock(index, 'up')}
                  disabled={index === 0}
                  title="Subir bloque"
                >
                  {icons.up}
                </button>
                <button 
                  className="note-form__block-action-btn"
                  onClick={() => moveBlock(index, 'down')}
                  disabled={index === blocks.length - 1}
                  title="Bajar bloque"
                >
                  {icons.down}
                </button>
                <button 
                  className="note-form__block-action-btn delete"
                  onClick={() => deleteBlock(block.id)}
                  title="Eliminar bloque"
                >
                  {icons.trash}
                </button>
              </div>

              {/* Block Body rendering */}
              <div className="note-form__block-body">
                {/* 1. TEXT BLOCK */}
                {block.type === 'text' && (
                  <textarea
                    className="note-form__textarea"
                    placeholder="Empieza a escribir..."
                    value={block.content}
                    onChange={(e) => updateTextBlock(block.id, e.target.value)}
                    rows={1}
                  />
                )}

                {/* 2. TODO CHECKLIST BLOCK */}
                {block.type === 'todo' && block.todoItems && (
                  <div className="note-form__todo-block">
                    <ul className="note-form__todo-items-list">
                      {block.todoItems.map((item) => (
                        <li key={item.id} className="note-form__todo-item-row">
                          <button
                            className={`note-form__todo-checkbox ${item.done ? 'checked' : ''}`}
                            onClick={() => updateTodoItem(block.id, item.id, item.text, !item.done)}
                          >
                            {item.done ? icons.checkboxChecked : icons.checkboxUnchecked}
                          </button>
                          <input
                            type="text"
                            className={`note-form__todo-input ${item.done ? 'checked' : ''}`}
                            placeholder="Elemento de lista"
                            value={item.text}
                            onChange={(e) => updateTodoItem(block.id, item.id, e.target.value, item.done)}
                          />
                          <button
                            className="note-form__todo-item-delete"
                            onClick={() => deleteTodoItem(block.id, item.id)}
                            title="Eliminar elemento"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="note-form__add-subitem-btn"
                      onClick={() => addTodoItem(block.id)}
                    >
                      {icons.plus} <span>Añadir tarea</span>
                    </button>
                  </div>
                )}

                {/* 3. NUMBERED LIST BLOCK */}
                {block.type === 'numbered' && block.listItems && (
                  <div className="note-form__numbered-block">
                    <ol className="note-form__numbered-items-list">
                      {block.listItems.map((item, itemIdx) => (
                        <li key={itemIdx} className="note-form__numbered-item-row">
                          <span className="note-form__numbered-prefix">{itemIdx + 1}.</span>
                          <input
                            type="text"
                            className="note-form__numbered-input"
                            placeholder="Elemento numerado"
                            value={item}
                            onChange={(e) => updateListItem(block.id, itemIdx, e.target.value)}
                          />
                          <button
                            className="note-form__numbered-item-delete"
                            onClick={() => deleteListItem(block.id, itemIdx)}
                            title="Eliminar elemento"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ol>
                    <button
                      className="note-form__add-subitem-btn"
                      onClick={() => addListItem(block.id)}
                    >
                      {icons.plus} <span>Añadir elemento</span>
                    </button>
                  </div>
                )}

                {/* 4. TABLE BLOCK */}
                {block.type === 'table' && block.tableData && (
                  <div className="note-form__table-block">
                    <div className="note-form__table-actions">
                      <button
                        className="note-form__table-action-btn"
                        onClick={() => addTableRow(block.id)}
                        title="Añadir fila"
                      >
                        {icons.addRow} Fila
                      </button>
                      <button
                        className="note-form__table-action-btn"
                        onClick={() => addTableColumn(block.id)}
                        title="Añadir columna"
                      >
                        {icons.addColumn} Columna
                      </button>
                    </div>

                    <div className="note-form__table-wrapper">
                      <table className="note-form__table">
                        <tbody>
                          {block.tableData.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx}>
                                  <input
                                    type="text"
                                    className="note-form__table-input"
                                    value={cell}
                                    onChange={(e) => updateTableCell(block.id, rIdx, cIdx, e.target.value)}
                                    placeholder="..."
                                  />
                                </td>
                              ))}
                              <td className="note-form__table-cell-delete">
                                <button
                                  className="note-form__cell-delete-btn"
                                  onClick={() => deleteTableRow(block.id, rIdx)}
                                  disabled={block.tableData!.rows.length <= 1}
                                  title="Borrar fila"
                                >
                                  ×
                                </button>
                              </td>
                            </tr>
                          ))}
                          {/* Column deletes helper header row under */}
                          <tr className="note-form__col-delete-row">
                            {block.tableData.rows[0].map((_, cIdx) => (
                              <td key={cIdx}>
                                <button
                                  className="note-form__col-delete-btn"
                                  onClick={() => deleteTableColumn(block.id, cIdx)}
                                  disabled={block.tableData!.rows[0].length <= 1}
                                  title="Borrar columna"
                                >
                                  × Col
                                </button>
                              </td>
                            ))}
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Bottom Block Adder (Float menu at bottom of container) */}
      <footer className="note-form__footer-menu">
        <span className="note-form__footer-label">Insertar bloque:</span>
        <div className="note-form__footer-buttons">
          <button 
            className="note-form__insert-btn"
            onClick={() => addBlock('text')}
            title="Añadir texto"
          >
            {icons.textBlock} <span>Texto</span>
          </button>
          <button 
            className="note-form__insert-btn"
            onClick={() => addBlock('todo')}
            title="Añadir lista de tareas"
          >
            {icons.todoBlock} <span>Tareas</span>
          </button>
          <button 
            className="note-form__insert-btn"
            onClick={() => addBlock('numbered')}
            title="Añadir lista numerada"
          >
            {icons.listBlock} <span>Lista</span>
          </button>
          <button 
            className="note-form__insert-btn"
            onClick={() => addBlock('table')}
            title="Añadir tabla"
          >
            {icons.tableBlock} <span>Tabla</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
