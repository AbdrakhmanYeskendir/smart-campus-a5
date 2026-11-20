import { it, expect } from 'vitest';
import { checkAvailability } from './availability';

it('T19 AC5: checkAvailability (used by App.tsx) does not change room.bookings', () => {
  const room = {
    id: 'A-101', name: 'A-101', building: 'Main', capacity: 30, equipment: [], blocked: false,
    bookings: [{ start: 600, end: 660, title: 'Existing' }],
  };
  const before = JSON.stringify(room.bookings);
  checkAvailability(room, 660, 720, 540); // accepted
  checkAvailability(room, 630, 690, 540); // rejected
  expect(JSON.stringify(room.bookings)).toBe(before);
});