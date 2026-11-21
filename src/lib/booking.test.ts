import { describe, it, expect } from 'vitest';
import { canBook } from './legacyBooking';

const NOW = 540;

type Booking = { start: number; end: number };

function defaultBookings(): Booking[] {
  return [{ start: 600, end: 660 }];
}

function defaultArgs(overrides?: Partial<{
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: Booking[];
}>) {
  return {
    start: 660,
    end: 720,
    now: NOW,
    blocked: false,
    bookings: defaultBookings(),
    ...overrides,
  };
}

describe('canBook', () => {
  // T01 — AC4: touching after existing booking is allowed
  it('T01: 660-720 touching after existing booking → true', () => {
    const args = defaultArgs({ start: 660, end: 720 });
    expect(canBook(args)).toBe(true);
  });

  // T02 — AC1: start equal to now is rejected
  it('T02: 540-570 start equals now → false', () => {
    expect(canBook(defaultArgs({ start: 540, end: 570 }))).toBe(false);
  });

  // T03 — AC1: zero-duration interval rejected
  it('T03: 720-720 zero duration → false', () => {
    expect(canBook(defaultArgs({ start: 720, end: 720 }))).toBe(false);
  });

  // T04 — AC1: reversed interval rejected
  it('T04: 750-720 reversed → false', () => {
    expect(canBook(defaultArgs({ start: 750, end: 720 }))).toBe(false);
  });

  // T05 — AC1: end past 1440 (24:00) rejected
  it('T05: 1380-1441 past day end → false', () => {
    expect(canBook(defaultArgs({ start: 1380, end: 1441 }))).toBe(false);
  });

  // T06 — AC2: exactly 120 minutes allowed
  it('T06: 720-840 (120 min) → true', () => {
    expect(canBook(defaultArgs({ start: 720, end: 840 }))).toBe(true);
  });

  // T07 — AC2: 121 minutes rejected
  it('T07: 720-841 (121 min) → false', () => {
    expect(canBook(defaultArgs({ start: 720, end: 841 }))).toBe(false);
  });

  // T08 — AC4: touching before existing booking is allowed
  it('T08: 570-600 touching before → true', () => {
    expect(canBook(defaultArgs({ start: 570, end: 600 }))).toBe(true);
  });

  // T09 — AC4: partial overlap rejected
  it('T09: 630-690 partial overlap → false', () => {
    expect(canBook(defaultArgs({ start: 630, end: 690 }))).toBe(false);
  });

  // T10 — AC4: request contains booking rejected
  it('T10: 570-690 contains booking → false', () => {
    expect(canBook(defaultArgs({ start: 570, end: 690 }))).toBe(false);
  });

  // T11 — AC4: request inside booking rejected
  it('T11: 615-645 inside booking → false', () => {
    expect(canBook(defaultArgs({ start: 615, end: 645 }))).toBe(false);
  });

  // T12 — AC4: identical interval rejected
  it('T12: 600-660 identical interval → false', () => {
    expect(canBook(defaultArgs({ start: 600, end: 660 }))).toBe(false);
  });

  // T13 — AC3: blocked room always rejected
  it('T13: 660-720 blocked room → false', () => {
    expect(canBook(defaultArgs({ start: 660, end: 720, blocked: true }))).toBe(false);
  });

  // T14 — AC4: no bookings, valid slot → true
  it('T14: 630-690 no bookings → true', () => {
    expect(canBook(defaultArgs({ start: 630, end: 690, bookings: [] }))).toBe(true);
  });

  // T15 — AC5: multiple accepted and rejected checks on the same fixture
  // leave bookings identical (same array reference, same length, same JSON).
  it('T15: repeated checks leave bookings unchanged', () => {
    const bookings = defaultBookings();
    const jsonSnapshot = JSON.stringify(bookings);

    // Accepted checks (should not mutate)
    canBook({ start: 660, end: 720, now: NOW, blocked: false, bookings });
    canBook({ start: 570, end: 600, now: NOW, blocked: false, bookings });
    canBook({ start: 720, end: 840, now: NOW, blocked: false, bookings });

    // Rejected checks (should not mutate)
    canBook({ start: 630, end: 690, now: NOW, blocked: false, bookings });
    canBook({ start: 540, end: 570, now: NOW, blocked: false, bookings });
    canBook({ start: 660, end: 720, now: NOW, blocked: true, bookings });

    expect(bookings).toHaveLength(1);
    expect(JSON.stringify(bookings)).toBe(jsonSnapshot);
    expect(bookings).toEqual([{ start: 600, end: 660 }]);
  });

  // T16 — AC1: end exactly at 24:00 (1440) is allowed; T05 only tests the reject side.
  it('T16: 1380-1440 ends exactly at 24:00 → true', () => {
    expect(canBook(defaultArgs({ start: 1380, end: 1440 }))).toBe(true);
  });

  // T17 — AC4: overlapping by one minute is rejected.
  // Catches an off-by-one (e.g. start <= b.end instead of start < b.end)
  // that T01's touching-after case would not detect.
  it('T17: 659-720 overlaps by one minute → false', () => {
    expect(canBook(defaultArgs({ start: 659, end: 720 }))).toBe(false);
  });
});
