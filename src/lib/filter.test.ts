import { describe, it, expect } from 'vitest';
import { ROOMS } from '../data';
import {
  NO_CRITERIA,
  collectEquipment,
  emptyStateMessage,
  filterRooms,
  matchesCriteria,
  parseAttendees,
} from './filter';

const names = (rooms: { name: string }[]) => rooms.map((room) => room.name);

describe('F1 capacity filter (capacity >= attendees)', () => {
  it('F1-01 exact capacity is included: 30 attendees keeps A-101 (capacity 30)', () => {
    const result = filterRooms(ROOMS, { minCapacity: 30, requiredEquipment: [] });
    expect(names(result)).toEqual(['A-101', 'B-201', 'D-110']);
  });

  it('F1-02 insufficient capacity is excluded: 31 attendees drops A-101', () => {
    const result = filterRooms(ROOMS, { minCapacity: 31, requiredEquipment: [] });
    expect(names(result)).toEqual(['B-201', 'D-110']);
  });

  it('F1-03 boundary on a larger room: 40 keeps B-201, 41 drops it', () => {
    expect(names(filterRooms(ROOMS, { minCapacity: 40, requiredEquipment: [] }))).toContain('B-201');
    expect(names(filterRooms(ROOMS, { minCapacity: 41, requiredEquipment: [] }))).toEqual(['D-110']);
  });

  it('F1-04 no capacity requirement keeps every room', () => {
    expect(filterRooms(ROOMS, NO_CRITERIA)).toHaveLength(ROOMS.length);
  });

  it('F1-05 attendees text: blank, valid, not a number, zero', () => {
    expect(parseAttendees('')).toEqual({ minCapacity: null, error: null });
    expect(parseAttendees(' 12 ')).toEqual({ minCapacity: 12, error: null });
    expect(parseAttendees('abc').minCapacity).toBeNull();
    expect(parseAttendees('abc').error).toBe('Enter attendees as a whole number, e.g. 12.');
    expect(parseAttendees('-3').minCapacity).toBeNull();
    expect(parseAttendees('0').error).toBe('Attendees must be at least 1.');
  });
});

describe('F2 equipment filter (ALL selected items required)', () => {
  it('F2-01 two items: Projector + Computers keeps only rooms that have both', () => {
    const result = filterRooms(ROOMS, { minCapacity: null, requiredEquipment: ['Projector', 'Computers'] });
    expect(names(result)).toEqual(['B-201', 'D-110']);
  });

  it('F2-02 one item returns every room that has it', () => {
    const result = filterRooms(ROOMS, { minCapacity: null, requiredEquipment: ['Whiteboard'] });
    expect(names(result)).toEqual(['A-101', 'A-102', 'C-305', 'D-110', 'E-004']);
  });

  it('F2-03 a room with extra, unselected equipment still matches', () => {
    const d110 = ROOMS.find((room) => room.id === 'd-110')!;
    expect(matchesCriteria(d110, { minCapacity: null, requiredEquipment: ['Whiteboard'] })).toBe(true);
  });

  it('F2-04 one missing item is enough to exclude a room (ALL, not ANY)', () => {
    const a101 = ROOMS.find((room) => room.id === 'a-101')!;
    expect(
      matchesCriteria(a101, { minCapacity: null, requiredEquipment: ['Projector', 'Computers'] })
    ).toBe(false);
  });

  it('F2-05 an item nobody has returns no rooms', () => {
    expect(filterRooms(ROOMS, { minCapacity: null, requiredEquipment: ['Piano'] })).toEqual([]);
  });

  it('F2-06 capacity and equipment combine with AND', () => {
    const result = filterRooms(ROOMS, { minCapacity: 40, requiredEquipment: ['Projector'] });
    expect(names(result)).toEqual(['B-201', 'D-110']);
  });
});

describe('F4 empty state and helpers', () => {
  it('F4-01 empty-state message appears only when nothing matches', () => {
    expect(emptyStateMessage(0)).toBe(
      'No rooms match your requirements. Try fewer equipment items or a smaller group size.'
    );
    expect(emptyStateMessage(1)).toBeNull();
  });

  it('F4-02 impossible requirements produce zero rooms and therefore the empty state', () => {
    const result = filterRooms(ROOMS, { minCapacity: 100, requiredEquipment: [] });
    expect(result).toHaveLength(0);
    expect(emptyStateMessage(result.length)).not.toBeNull();
  });

  it('H-01 filtering keeps catalog order and does not change the catalog', () => {
    const before = JSON.stringify(ROOMS);
    const result = filterRooms(ROOMS, { minCapacity: 10, requiredEquipment: ['Whiteboard'] });
    expect(names(result)).toEqual(['A-101', 'A-102', 'C-305', 'D-110']);
    expect(JSON.stringify(ROOMS)).toBe(before);
  });

  it('H-02 equipment list for the checkboxes is unique and sorted', () => {
    const items = collectEquipment(ROOMS);
    expect(new Set(items).size).toBe(items.length);
    expect(items).toEqual([...items].sort((a, b) => a.localeCompare(b)));
    expect(items).toContain('Projector');
  });
});
