import type { Room } from '../types';

/** What the user asked for. Pure data, no UI state. */
export interface RoomCriteria {
  /** F1: number of attendees; the room capacity must be >= this. null = no requirement. */
  minCapacity: number | null;
  /** F2: the room must contain ALL of these items. */
  requiredEquipment: string[];
}

export const NO_CRITERIA: RoomCriteria = { minCapacity: null, requiredEquipment: [] };

/** F1 + F2 for a single room. Blocked rooms are NOT excluded here (see F3 in availability.ts). */
export function matchesCriteria(room: Room, criteria: RoomCriteria): boolean {
  const capacityOk = criteria.minCapacity === null || room.capacity >= criteria.minCapacity;
  const equipmentOk = criteria.requiredEquipment.every((item) => room.equipment.includes(item));
  return capacityOk && equipmentOk;
}

/** Returns a new array (input is never mutated); keeps the catalog order. */
export function filterRooms(rooms: readonly Room[], criteria: RoomCriteria): Room[] {
  return rooms.filter((room) => matchesCriteria(room, criteria));
}

/** Distinct equipment names of the catalog, sorted, used to build the filter checkboxes. */
export function collectEquipment(rooms: readonly Room[]): string[] {
  return [...new Set(rooms.flatMap((room) => room.equipment))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export interface AttendeesParse {
  minCapacity: number | null;
  error: string | null;
}

/** Turns the raw "attendees" text into a capacity requirement. Blank = no requirement. */
export function parseAttendees(raw: string): AttendeesParse {
  const text = raw.trim();
  if (text === '') return { minCapacity: null, error: null };
  if (!/^\d+$/.test(text)) {
    return { minCapacity: null, error: 'Enter attendees as a whole number, e.g. 12.' };
  }
  const value = Number(text);
  if (value < 1) {
    return { minCapacity: null, error: 'Attendees must be at least 1.' };
  }
  return { minCapacity: value, error: null };
}

/** F4: message for the empty state, or null when at least one room matches. */
export function emptyStateMessage(matchCount: number): string | null {
  return matchCount > 0
    ? null
    : 'No rooms match your requirements. Try fewer equipment items or a smaller group size.';
}
