import { describe, it, expect } from 'vitest';
import { ROOMS } from '../data';
import { evaluateRequest } from './availabilityRequest';
import { filterRooms } from './filter';
import { checkAvailability } from './availability';
import { labelToMinutes } from './time';
import type { Room } from '../types';

const NOW = '08:30';
const room = (id: string): Room => ROOMS.find((r) => r.id === id)!;
const ask = (r: Room, start: string, end: string) => evaluateRequest(r, { start, end, now: NOW });

describe('integration: catalog -> filters -> selected room -> deterministic rules', () => {
  it('I01 F3: a blocked room is never available, for any valid free slot', () => {
    const blocked = ROOMS.filter((r) => r.blocked);
    expect(blocked.length).toBeGreaterThan(0);
    for (const r of blocked) {
      for (const [start, end] of [['09:00', '10:00'], ['10:30', '11:30'], ['15:00', '16:00'], ['20:00', '21:00']]) {
        const decision = ask(r, start, end);
        expect(decision.status).toBe('unavailable');
        expect(decision.status === 'unavailable' && decision.reason).toContain('blocked');
      }
    }
  });

  it('I02 F3: the block flag is the only reason (the same room unblocked is available)', () => {
    const unblocked: Room = { ...room('a-102'), blocked: false };
    expect(ask(room('a-102'), '10:30', '11:30').status).toBe('unavailable');
    expect(ask(unblocked, '10:30', '11:30')).toEqual({ status: 'available' });
  });

  it('I03 the availability result uses the chosen room bookings (same slot, different rooms)', () => {
    const results = ROOMS.filter((r) => !r.blocked).map((r) => [r.name, ask(r, '10:30', '11:30').status]);
    expect(results).toEqual([
      ['A-101', 'unavailable'],
      ['B-201', 'available'],
      ['C-305', 'available'],
      ['D-110', 'unavailable'],
      ['E-004', 'available'],
    ]);
  });

  it('I04 filtering returns the real catalog objects, so bookings cannot come from another room', () => {
    const result = filterRooms(ROOMS, { minCapacity: 30, requiredEquipment: ['Projector'] });
    for (const r of result) {
      expect(ROOMS.includes(r)).toBe(true);
    }
  });

  it('I05 end to end: 30 attendees + Projector -> pick D-110 -> touching slot is available, overlap is not', () => {
    const matches = filterRooms(ROOMS, { minCapacity: 30, requiredEquipment: ['Projector'] });
    expect(matches.map((r) => r.name)).toEqual(['A-101', 'B-201', 'D-110']);
    const d110 = matches.find((r) => r.id === 'd-110')!;
    expect(ask(d110, '11:00', '12:00')).toEqual({ status: 'available' }); // touches 11:00
    expect(ask(d110, '10:30', '11:30').status).toBe('unavailable'); // overlaps Algorithms Lecture
  });

  it('I06 boundaries 120 vs 121 minutes on a free room', () => {
    expect(ask(room('c-305'), '10:00', '12:00')).toEqual({ status: 'available' });
    expect(ask(room('c-305'), '10:00', '12:01')).toEqual({
      status: 'unavailable',
      reason: 'Bookings cannot be longer than 120 minutes.',
    });
  });

  it('I07 boundaries touching vs overlapping on E-004 (booked 12:00-13:00)', () => {
    expect(ask(room('e-004'), '11:00', '12:00')).toEqual({ status: 'available' });
    expect(ask(room('e-004'), '13:00', '14:00')).toEqual({ status: 'available' });
    const overlap = ask(room('e-004'), '11:59', '12:30');
    expect(overlap.status === 'unavailable' && overlap.reason).toContain('Study Group');
  });

  it('I08 the whole pipeline leaves the catalog untouched', () => {
    const before = JSON.stringify(ROOMS);
    for (const r of filterRooms(ROOMS, { minCapacity: 8, requiredEquipment: [] })) {
      ask(r, '09:00', '10:00');
      ask(r, '10:30', '11:30');
      checkAvailability(r, 600, 660, labelToMinutes(NOW)!);
    }
    expect(JSON.stringify(ROOMS)).toBe(before);
  });
});

// Characterization ("golden master") test for the refactoring: the logic that used to
// live inline in App.tsx handleCheck (copied from the initial commit) must give the same
// answer as the extracted evaluateRequest for every input in a grid.
function legacyHandleCheck(r: Room, startTime: string, endTime: string, currentTime: string) {
  const start = labelToMinutes(startTime);
  const end = labelToMinutes(endTime);
  if (start === null || end === null) {
    return { status: 'unavailable', reason: 'Please enter valid times in HH:MM format.' };
  }
  const now = labelToMinutes(currentTime);
  if (now === null) {
    return { status: 'unavailable', reason: 'Please enter a valid current time in HH:MM format.' };
  }
  return checkAvailability(r, start, end, now);
}

describe('refactoring parity', () => {
  it('P01 evaluateRequest equals the original inline handleCheck on every grid input', () => {
    const labels = ['', 'abc', '8:30', '08:30', '09:00', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '24:00', '24:01', '10:60'];
    let compared = 0;
    let differences = 0;
    let available = 0;
    for (const r of ROOMS) {
      for (const s of labels) {
        for (const e of labels) {
          for (const c of labels) {
            const legacy = legacyHandleCheck(r, s, e, c);
            const current = evaluateRequest(r, { start: s, end: e, now: c });
            compared++;
            if (JSON.stringify(legacy) !== JSON.stringify(current)) differences++;
            if (current.status === 'available') available++;
          }
        }
      }
    }
    expect(compared).toBe(ROOMS.length * labels.length ** 3);
    expect(differences).toBe(0);
    expect(available).toBeGreaterThan(0);
  });
});
