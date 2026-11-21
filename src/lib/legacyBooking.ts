import type { Room } from '../types';
import { checkAvailability } from './availability';

/** The argument shape of the original Practice #07 `canBook` API. */
export interface LegacyBookingRequest {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: { start: number; end: number }[];
}

/**
 * Adapter (GoF): adapts the legacy boolean `canBook` call to the current
 * `checkAvailability(room, start, end, now)` rules. The rules live only in
 * availability.ts; this file only translates the shape of the input and output.
 */
export function toRoom(args: LegacyBookingRequest): Room {
  return {
    id: '',
    name: '',
    building: '',
    capacity: 0,
    equipment: [],
    blocked: args.blocked,
    bookings: args.bookings.map((b) => ({ ...b, title: '' })),
  };
}

export function canBook(args: LegacyBookingRequest): boolean {
  return checkAvailability(toRoom(args), args.start, args.end, args.now).status === 'available';
}
