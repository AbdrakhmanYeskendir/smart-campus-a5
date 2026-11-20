import type { Room } from './types';

export const SUPPLIED_CURRENT_TIME = 510; // 08:30

export const ROOMS: Room[] = [
  {
    id: 'a-101',
    name: 'A-101',
    building: 'Arts Building',
    capacity: 30,
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
    blocked: true,
    blockReason: 'Closed for maintenance',
    bookings: [],
  },
  {
    id: 'b-201',
    name: 'B-201',
    building: 'Science Block',
    capacity: 40,
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
    blocked: false,
    bookings: [],
  },
];
