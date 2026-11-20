import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';

// Regression tests carried over from Practice #08 (unsorted booking fixtures, AC5).
describe('AC5 immutability with unsorted fixtures (from Practice #08)', () => {
  it('T20 AC5: checkAvailability does not reorder room.bookings (unsorted fixture)', () => {
    const room = {
      id: 'A-101', name: 'A-101', building: 'Main', capacity: 30, equipment: [], blocked: false,
      bookings: [
        { start: 840, end: 900, title: 'Faculty Meeting' },
        { start: 600, end: 660, title: 'Intro to Design' },
      ],
    };
    const before = JSON.stringify(room.bookings);
    checkAvailability(room, 700, 760, 540); // accepted
    checkAvailability(room, 620, 680, 540); // rejected
    expect(JSON.stringify(room.bookings)).toBe(before);
  });

  it('T21 AC4+AC5: back-to-back slot between unsorted bookings is available and bookings stay untouched', () => {
    const room = {
      id: 'A-101', name: 'A-101', building: 'Main', capacity: 30, equipment: [], blocked: false,
      bookings: [
        { start: 780, end: 840, title: 'Later' },
        { start: 600, end: 660, title: 'Earlier' },
      ],
    };
    const before = JSON.stringify(room.bookings);
    expect(checkAvailability(room, 660, 780, 540)).toEqual({ status: 'available' }); // touches both ends
    expect(JSON.stringify(room.bookings)).toBe(before);
  });
});
