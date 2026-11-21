import type { Room } from './types';

export const SUPPLIED_CURRENT_TIME = 510; // 08:30

// Fictional catalog: every room has an id, name, capacity, equipment list,
// blocked status and its own bookings (minutes after midnight).
/**
 * R2 mitigation: freezes the catalog and everything inside it, so code that tries
 * to add a booking or edit a room throws a TypeError instead of silently changing
 * the shared data (AC5).
 */
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

export const ROOMS: Room[] = deepFreeze([
  {
    id: 'a-101',
    name: 'A-101',
    building: 'Arts Building',
    capacity: 30,
    equipment: ['Projector', 'Whiteboard', 'Power outlets'],
    blocked: false,
    bookings: [
      { start: 600, end: 660, title: 'Intro to Design' },
      { start: 840, end: 900, title: 'Faculty Meeting' },
    ],
  },
  {
    id: 'a-102',
    name: 'A-102',
    building: 'Arts Building',
    capacity: 24,
    equipment: ['Projector', 'Whiteboard'],
    blocked: true,
    blockReason: 'Closed for maintenance',
    bookings: [],
  },
  {
    id: 'b-201',
    name: 'B-201',
    building: 'Science Block',
    capacity: 40,
    equipment: ['Projector', 'Computers', 'Lab benches', 'Power outlets'],
    blocked: false,
    bookings: [
      { start: 540, end: 570, title: 'Lab Safety Briefing' },
      { start: 840, end: 930, title: 'Chemistry 201' },
    ],
  },
  {
    id: 'c-305',
    name: 'C-305',
    building: 'Library Wing',
    capacity: 16,
    equipment: ['Whiteboard', 'Video conferencing'],
    blocked: false,
    bookings: [],
  },
  {
    id: 'd-110',
    name: 'D-110',
    building: 'Engineering Hall',
    capacity: 60,
    equipment: ['Projector', 'Whiteboard', 'Video conferencing', 'Computers', 'Power outlets'],
    blocked: false,
    bookings: [
      { start: 570, end: 660, title: 'Algorithms Lecture' },
      { start: 780, end: 840, title: 'Project Defence' },
    ],
  },
  {
    id: 'e-004',
    name: 'E-004',
    building: 'Student Hub',
    capacity: 8,
    equipment: ['Whiteboard', 'Power outlets'],
    blocked: false,
    bookings: [{ start: 720, end: 780, title: 'Study Group' }],
  },
]);
