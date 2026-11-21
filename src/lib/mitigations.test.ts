import { describe, it, expect } from 'vitest';
import { ROOMS } from '../data';
import { canCheck, createInitialState, createReducer, visibleRooms } from './state';
import type { Action, AppState } from './state';

const reducer = createReducer(ROOMS);
const initial = () => createInitialState(ROOMS, '08:30');
const run = (actions: Action[], from: AppState = initial()): AppState =>
  actions.reduce((state, action) => reducer(state, action), from);

// R1: unreadable attendees text used to be ignored, so a check could run for a
// room that was never filtered by group size.
describe('M1 (R1): no availability check while the attendees value is invalid', () => {
  for (const value of ['abc', '12.5', '-3', '0', '1e2']) {
    it(`M1-01 "${value}": the check is refused and no decision is shown`, () => {
      const state = run([{ type: 'setAttendees', value }, { type: 'check' }]);
      expect(state.decision).toBeNull();
      expect(canCheck(ROOMS, state)).toBe(false);
    });
  }

  it('M1-02 S12 still holds: invalid text does not hide rooms, it only blocks the check', () => {
    const state = run([{ type: 'setAttendees', value: 'abc' }]);
    expect(visibleRooms(ROOMS, state)).toHaveLength(ROOMS.length);
  });

  it('M1-03 after correcting the value the check works again', () => {
    const state = run([
      { type: 'setAttendees', value: 'abc' },
      { type: 'setAttendees', value: '20' },
      { type: 'check' },
    ]);
    expect(canCheck(ROOMS, state)).toBe(true);
    expect(state.decision).not.toBeNull();
  });

  it('M1-04 blank attendees (no requirement) can still be checked', () => {
    const state = run([{ type: 'check' }]);
    expect(canCheck(ROOMS, initial())).toBe(true);
    expect(state.decision).not.toBeNull();
  });
});

// R2: the catalog is a shared module-level object; any code that pushes a
// booking into it silently changes every later check (AC5) and other tests.
describe('M2 (R2): the room catalog cannot be mutated at runtime', () => {
  it('M2-01 the catalog, every room, booking list, booking and equipment list are frozen', () => {
    expect(Object.isFrozen(ROOMS)).toBe(true);
    for (const room of ROOMS) {
      expect(Object.isFrozen(room)).toBe(true);
      expect(Object.isFrozen(room.bookings)).toBe(true);
      expect(Object.isFrozen(room.equipment)).toBe(true);
      for (const booking of room.bookings) expect(Object.isFrozen(booking)).toBe(true);
    }
  });

  it('M2-02 an attempt to add a booking or edit a room throws and changes nothing', () => {
    const before = JSON.stringify(ROOMS);
    expect(() => ROOMS[0].bookings.push({ start: 700, end: 720, title: 'x' })).toThrow(TypeError);
    expect(() => {
      ROOMS[1].blocked = false;
    }).toThrow(TypeError);
    expect(() => ROOMS.pop()).toThrow(TypeError);
    expect(JSON.stringify(ROOMS)).toBe(before);
  });
});
