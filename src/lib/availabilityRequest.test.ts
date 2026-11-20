import { describe, it, expect } from 'vitest';
import { evaluateRequest } from './availabilityRequest';
import type { Room } from '../types';

const NOW = '08:30'; // supplied current time used by the UI

// Fresh fixture per call; bookings are deliberately NOT sorted by start time.
function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'a-101',
    name: 'A-101',
    building: 'Arts Building',
    capacity: 30,
    equipment: [],
    blocked: false,
    bookings: [
      { start: 840, end: 900, title: 'Faculty Meeting' }, // 14:00-15:00
      { start: 600, end: 660, title: 'Intro to Design' }, // 10:00-11:00
    ],
    ...overrides,
  };
}

function ask(room: Room, start: string, end: string, now: string = NOW) {
  return evaluateRequest(room, { start, end, now });
}

describe('evaluateRequest (original AC1-AC5 through the form entry point)', () => {
  it('T22 AC1: start before the current time -> unavailable', () => {
    expect(ask(makeRoom(), '08:00', '09:00')).toEqual({
      status: 'unavailable',
      reason: 'Start time must be after the current time (08:30).',
    });
  });

  it('T23 AC1: start equal to the current time -> unavailable', () => {
    expect(ask(makeRoom(), '08:30', '09:30')).toEqual({
      status: 'unavailable',
      reason: 'Start time must be after the current time (08:30).',
    });
  });

  it('T24 AC1: start after end (reversed interval) -> unavailable', () => {
    expect(ask(makeRoom(), '11:00', '10:00')).toEqual({
      status: 'unavailable',
      reason: 'Start time must be earlier than end time.',
    });
  });

  it('T25 AC2: 121 minutes -> unavailable', () => {
    expect(ask(makeRoom(), '11:00', '13:01')).toEqual({
      status: 'unavailable',
      reason: 'Bookings cannot be longer than 120 minutes.',
    });
  });

  it('T26 AC2: exactly 120 minutes -> available', () => {
    expect(ask(makeRoom(), '11:30', '13:30')).toEqual({ status: 'available' });
  });

  it('T27 AC3: blocked room with a reason -> unavailable with that reason', () => {
    const room = makeRoom({ name: 'A-102', blocked: true, blockReason: 'Closed for maintenance', bookings: [] });
    expect(ask(room, '10:30', '11:30')).toEqual({
      status: 'unavailable',
      reason: 'A-102 is blocked: Closed for maintenance.',
    });
  });

  it('T28 AC3: blocked room without a reason -> generic blocked message', () => {
    const room = makeRoom({ blocked: true, bookings: [] });
    expect(ask(room, '10:30', '11:30')).toEqual({
      status: 'unavailable',
      reason: 'A-101 is currently blocked.',
    });
  });

  it('T29 AC4: partial overlap -> unavailable and names the booking', () => {
    expect(ask(makeRoom(), '10:30', '11:30')).toEqual({
      status: 'unavailable',
      reason: 'Overlaps existing booking "Intro to Design" (10:00\u201311:00).',
    });
  });

  it('T30 AC4: touching an existing booking at either end -> available', () => {
    expect(ask(makeRoom(), '09:00', '10:00')).toEqual({ status: 'available' });
    expect(ask(makeRoom(), '11:00', '12:00')).toEqual({ status: 'available' });
  });

  it('T31 AC5: fixtures keep content and order after accepted, rejected and invalid checks', () => {
    const room = makeRoom();
    const before = JSON.stringify(room);
    ask(room, '11:00', '12:00');
    ask(room, '10:30', '11:30');
    ask(room, '11:00', '13:01');
    ask(room, 'abc', '10:00');
    expect(JSON.stringify(room)).toBe(before);
  });

  it('T32 AC6: unparsable start or end -> HH:MM format message', () => {
    const expected = { status: 'unavailable', reason: 'Please enter valid times in HH:MM format.' };
    expect(ask(makeRoom(), 'abc', '10:00')).toEqual(expected);
    expect(ask(makeRoom(), '10:00', '')).toEqual(expected);
    expect(ask(makeRoom(), '23:30', '24:30')).toEqual(expected);
  });

  it('T33 AC6: unparsable current time -> current-time format message', () => {
    expect(ask(makeRoom(), '10:00', '11:00', 'xx')).toEqual({
      status: 'unavailable',
      reason: 'Please enter a valid current time in HH:MM format.',
    });
  });

  it('T34 AC6: a bad start/end is reported before a bad current time', () => {
    expect(ask(makeRoom(), 'abc', '11:00', 'xx')).toEqual({
      status: 'unavailable',
      reason: 'Please enter valid times in HH:MM format.',
    });
  });
});
