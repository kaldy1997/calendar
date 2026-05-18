import Dexie, { type Table } from 'dexie';
import type { CalendarEvent } from '../types/types';

const dbName = typeof process !== 'undefined' && process.env.VITEST
  ? `CalendarDatabase_${Math.random().toString(36).substring(2, 11)}`
  : 'CalendarDatabase';

export class CalendarDatabase extends Dexie {
  events!: Table<CalendarEvent>;

  constructor() {
    super(dbName);
    this.version(1).stores({
      events: 'id, date, title' // id is primary key, date and title are indexed
    });
  }

  async reset() {
    await this.delete();
    await this.open();
  }
}

export const db = new CalendarDatabase();
