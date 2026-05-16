export interface Category {
  id: string;
  label: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 'routines', label: 'Rutinas', color: '#7c5cfc' }, // Purple
  { id: 'sports', label: 'Deportes', color: '#22c55e' }, // Green
  { id: 'cleaning', label: 'Limpieza', color: '#3b82f6' }, // Blue
  { id: 'work', label: 'Trabajo', color: '#f97316' }, // Orange
  { id: 'couple', label: 'Pareja', color: '#ec4899' }, // Pink
  { id: 'events', label: 'Eventos', color: '#ef4444' }, // Red
  { id: 'health', label: 'Salud', color: '#10b981' }, // Emerald
  { id: 'finance', label: 'Finanzas', color: '#eab308' }, // Yellow
  { id: 'leisure', label: 'Ocio', color: '#8b5cf6' }, // Violet
  { id: 'personal', label: 'Personal', color: '#06b6d4' }, // Cyan
];

export const getCategoryById = (id: string) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
