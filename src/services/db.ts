import Dexie, { type Table } from 'dexie';
import type { CalendarEvent, CustomAlarm, ConfiguredTimer } from '../types/types';

const isVitest = typeof globalThis !== 'undefined' && 
  (globalThis as any).process && 
  (globalThis as any).process.env && 
  (globalThis as any).process.env.VITEST;

const dbName = isVitest
  ? `CalendarDatabase_${Math.random().toString(36).substring(2, 11)}`
  : 'CalendarDatabase';

export class CalendarDatabase extends Dexie {
  events!: Table<CalendarEvent>;
  customAlarms!: Table<CustomAlarm>;
  customTimers!: Table<ConfiguredTimer>;

  constructor() {
    super(dbName);
    this.version(1).stores({
      events: 'id, date, title' // id is primary key, date and title are indexed
    });
    this.version(2).stores({
      events: 'id, date, title',
      customAlarms: 'id, time, isActive'
    });
    this.version(3).stores({
      events: 'id, date, title',
      customAlarms: 'id, time, isActive',
      customTimers: 'id'
    });
  }


  async reset() {
    await this.delete();
    await this.open();
  }
}

export const db = new CalendarDatabase();
