import { describe, it, expect } from 'vitest';
import { checkAvailability } from './availability';
import { canBook, toRoom } from './legacyBooking';

describe('Adapter: legacy canBook -> checkAvailability', () => {
  it('P02 canBook gives the same answer as checkAvailability for every slot of the day', () => {
    const bookings = [{ start: 600, end: 660 }, { start: 840, end: 900 }];
    for (const blocked of [false, true]) {
      for (let start = 480; start <= 1080; start += 15) {
        for (let end = start - 15; end <= start + 135; end += 15) {
          const args = { start, end, now: 540, blocked, bookings };
          const expected =
            checkAvailability(toRoom(args), start, end, 540).status === 'available';
          expect(canBook(args)).toBe(expected);
        }
      }
    }
  });

  it('P03 the adapter copies the bookings and never mutates the caller input', () => {
    const bookings = [{ start: 600, end: 660 }];
    const room = toRoom({ start: 0, end: 0, now: 0, blocked: false, bookings });
    expect(room.bookings).not.toBe(bookings);
    expect(room.bookings).toEqual([{ start: 600, end: 660, title: '' }]);
    expect(bookings).toEqual([{ start: 600, end: 660 }]);
  });
});
