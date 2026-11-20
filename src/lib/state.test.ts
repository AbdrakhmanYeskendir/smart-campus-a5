import { describe, it, expect } from 'vitest';
import { ROOMS } from '../data';
import { createInitialState, createReducer, selectedRoom, visibleRooms } from './state';
import type { Action, AppState } from './state';

const reducer = createReducer(ROOMS);
const initial = () => createInitialState(ROOMS, '08:30');
const run = (actions: Action[], from: AppState = initial()): AppState =>
  actions.reduce((state, action) => reducer(state, action), from);

describe('screen behaviour (reducer): room switching F5, filters, empty state', () => {
  it('S01 initial state: first room selected, no filters, no decision, all rooms visible', () => {
    const state = initial();
    expect(state.roomId).toBe('a-101');
    expect(state.attendees).toBe('');
    expect(state.requiredEquipment).toEqual([]);
    expect(state.decision).toBeNull();
    expect(state.currentTime).toBe('08:30');
    expect(visibleRooms(ROOMS, state)).toHaveLength(ROOMS.length);
  });

  it('S02 F5: switching the room clears the previous result', () => {
    const checked = run([{ type: 'check' }]);
    expect(checked.decision?.status).toBe('unavailable'); // A-101 10:30-11:30 overlaps
    const switched = reducer(checked, { type: 'selectRoom', roomId: 'c-305' });
    expect(switched.roomId).toBe('c-305');
    expect(switched.decision).toBeNull();
  });

  it('S03 F5: after switching, the check uses the chosen room bookings, not another room', () => {
    const outcome = (roomId: string) => {
      const state = run([{ type: 'selectRoom', roomId }, { type: 'check' }]);
      return state.decision;
    };
    const a101 = outcome('a-101');
    const c305 = outcome('c-305');
    const d110 = outcome('d-110');
    const e004 = outcome('e-004');
    expect(a101?.status === 'unavailable' && a101.reason).toContain('Intro to Design');
    expect(c305).toEqual({ status: 'available' });
    expect(d110?.status === 'unavailable' && d110.reason).toContain('Algorithms Lecture');
    expect(e004).toEqual({ status: 'available' });
  });

  it('S04 changing the start, end or current time clears the result', () => {
    const checked = run([{ type: 'check' }]);
    for (const action of [
      { type: 'setStartTime', value: '12:00' },
      { type: 'setEndTime', value: '12:30' },
      { type: 'setCurrentTime', value: '09:00' },
    ] as Action[]) {
      expect(reducer(checked, action).decision).toBeNull();
    }
  });

  it('S05 a filter that hides the selected room moves the selection to the first visible room', () => {
    const state = run([{ type: 'setAttendees', value: '31' }]);
    expect(visibleRooms(ROOMS, state).map((room) => room.id)).toEqual(['b-201', 'd-110']);
    expect(state.roomId).toBe('b-201');
    expect(state.decision).toBeNull();
  });

  it('S06 a filter that keeps the selected room keeps the selection but clears the result', () => {
    const state = run([
      { type: 'selectRoom', roomId: 'b-201' },
      { type: 'check' },
      { type: 'setAttendees', value: '31' },
    ]);
    expect(state.roomId).toBe('b-201');
    expect(state.decision).toBeNull();
  });

  it('S07 F4: no matching room means nothing selected and the check does nothing', () => {
    const state = run([{ type: 'setAttendees', value: '100' }]);
    expect(visibleRooms(ROOMS, state)).toHaveLength(0);
    expect(state.roomId).toBe('');
    expect(selectedRoom(ROOMS, state)).toBeNull();
    expect(reducer(state, { type: 'check' })).toBe(state);
  });

  it('S08 equipment checkboxes toggle on and off; clearing filters restores all rooms', () => {
    const filtered = run([
      { type: 'toggleEquipment', item: 'Projector' },
      { type: 'toggleEquipment', item: 'Computers' },
    ]);
    expect(visibleRooms(ROOMS, filtered).map((room) => room.id)).toEqual(['b-201', 'd-110']);
    expect(filtered.roomId).toBe('b-201');

    const oneOff = reducer(filtered, { type: 'toggleEquipment', item: 'Computers' });
    expect(oneOff.requiredEquipment).toEqual(['Projector']);

    const cleared = reducer(filtered, { type: 'clearFilters' });
    expect(cleared.requiredEquipment).toEqual([]);
    expect(cleared.attendees).toBe('');
    expect(visibleRooms(ROOMS, cleared)).toHaveLength(ROOMS.length);
  });

  it('S09 selecting a room that the filters hide is ignored', () => {
    const state = run([{ type: 'setAttendees', value: '31' }]);
    expect(reducer(state, { type: 'selectRoom', roomId: 'c-305' })).toBe(state);
  });

  it('S10 F3: a blocked room is reported unavailable through the screen logic', () => {
    const state = run([{ type: 'selectRoom', roomId: 'a-102' }, { type: 'check' }]);
    expect(state.decision).toEqual({
      status: 'unavailable',
      reason: 'A-102 is blocked: Closed for maintenance.',
    });
  });

  it('S11 the reducer never mutates the previous state or the catalog', () => {
    const before = initial();
    const snapshotState = JSON.stringify(before);
    const snapshotRooms = JSON.stringify(ROOMS);
    run(
      [
        { type: 'setAttendees', value: '20' },
        { type: 'toggleEquipment', item: 'Whiteboard' },
        { type: 'check' },
        { type: 'clearFilters' },
      ],
      before
    );
    expect(JSON.stringify(before)).toBe(snapshotState);
    expect(JSON.stringify(ROOMS)).toBe(snapshotRooms);
  });

  it('S12 unreadable attendees text does not filter anything out', () => {
    const state = run([{ type: 'setAttendees', value: 'abc' }]);
    expect(visibleRooms(ROOMS, state)).toHaveLength(ROOMS.length);
  });
});
