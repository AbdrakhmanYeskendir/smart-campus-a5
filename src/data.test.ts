import { describe, it, expect } from 'vitest';
import { ROOMS } from './data';

describe('room catalog (fictional data)', () => {
  it('D01 has at least four rooms', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
  });

  it('D02 room ids are unique', () => {
    const ids = ROOMS.map((room) => room.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('D03 every room has id, name, capacity, equipment list, blocked flag and bookings', () => {
    for (const room of ROOMS) {
      expect(room.id.length).toBeGreaterThan(0);
      expect(room.name.length).toBeGreaterThan(0);
      expect(room.capacity).toBeGreaterThan(0);
      expect(room.equipment.length).toBeGreaterThan(0);
      expect(room.equipment.every((item) => item.trim().length > 0)).toBe(true);
      expect(typeof room.blocked).toBe('boolean');
      expect(Array.isArray(room.bookings)).toBe(true);
    }
  });

  it('D04 every booking is inside the day and a room never double-books itself', () => {
    for (const room of ROOMS) {
      const sorted = [...room.bookings].sort((a, b) => a.start - b.start);
      for (const booking of sorted) {
        expect(booking.start).toBeGreaterThanOrEqual(0);
        expect(booking.start).toBeLessThan(booking.end);
        expect(booking.end).toBeLessThanOrEqual(1440);
      }
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1].end).toBeLessThanOrEqual(sorted[i].start);
      }
    }
  });

  it('D05 at least one room is blocked and explains why (needed for F3)', () => {
    const blocked = ROOMS.filter((room) => room.blocked);
    expect(blocked.length).toBeGreaterThanOrEqual(1);
    expect(blocked.every((room) => (room.blockReason ?? '').length > 0)).toBe(true);
  });

  it('D06 rooms have different bookings (so a wrong-room lookup would be visible)', () => {
    const signatures = ROOMS.map((room) => JSON.stringify(room.bookings));
    expect(new Set(signatures).size).toBeGreaterThanOrEqual(3);
  });
});
