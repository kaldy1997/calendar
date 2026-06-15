export interface NoteTodoItem {
  id: string;
  text: string;
  done: boolean;
}

export interface NoteTableData {
  rows: string[][]; // A grid of cells
}

export type NoteBlockType = 'text' | 'todo' | 'numbered' | 'table';

export interface NoteBlock {
  id: string;
  type: NoteBlockType;
  content: string; // Used for text blocks or individual list elements if needed
  todoItems?: NoteTodoItem[]; // Used for todo checklist block
  listItems?: string[]; // Used for numbered list block
  tableData?: NoteTableData; // Used for table block
}

export interface Note {
  id: string;
  title: string;
  blocks: NoteBlock[];
  color: string; // Background color class or hex (e.g. 'charcoal', 'purple', etc.)
  labels: string[];
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}
