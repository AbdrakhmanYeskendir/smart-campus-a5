import type { AvailabilityDecision, Room, ValidationResult } from '../types';
import { minutesToLabel } from './time';

export function validateInterval(
  start: number,
  end: number,
  currentTime: number
): ValidationResult {
  if (start < 0 || end > 1440) {
    return {
      valid: false,
      reason: 'Times must be between 00:00 and 24:00.',
    };
  }
  if (!(start < end)) {
    return {
      valid: false,
      reason: 'Start time must be earlier than end time.',
    };
  }
  if (start <= currentTime) {
    return {
      valid: false,
      reason: `Start time must be after the current time (${minutesToLabel(
        currentTime
      )}).`,
    };
  }
  if (end - start > 120) {
    return {
      valid: false,
      reason: 'Bookings cannot be longer than 120 minutes.',
    };
  }
  return { valid: true };
}

export function checkAvailability(
  room: Room,
  start: number,
  end: number,
  currentTime: number
): AvailabilityDecision {
  const validation = validateInterval(start, end, currentTime);
  if (!validation.valid) {
    return { status: 'unavailable', reason: validation.reason };
  }

  if (room.blocked) {
    return {
      status: 'unavailable',
      reason: room.blockReason
        ? `${room.name} is blocked: ${room.blockReason}.`
        : `${room.name} is currently blocked.`,
    };
  }

  const conflict = room.bookings.find(
    (b) => start < b.end && end > b.start
  );
  if (conflict) {
    return {
      status: 'unavailable',
      reason: `Overlaps existing booking "${conflict.title}" (${minutesToLabel(
        conflict.start
      )}–${minutesToLabel(conflict.end)}).`,
    };
  }
  return { status: 'available' };
}
