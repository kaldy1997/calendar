import Dexie, { type Table } from 'dexie';
import type { CalendarEvent } from '../types/types';

export class CalendarDatabase extends Dexie {
  events!: Table<CalendarEvent>;

  constructor() {
    super('CalendarDatabase');
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
