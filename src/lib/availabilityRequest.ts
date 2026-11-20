import type { AvailabilityDecision, Room } from '../types';
import { checkAvailability } from './availability';
import { labelToMinutes } from './time';

/** Raw HH:MM strings exactly as the form holds them. */
export interface AvailabilityRequestInput {
  start: string;
  end: string;
  now: string;
}

function unavailable(reason: string): AvailabilityDecision {
  return { status: 'unavailable', reason };
}

/**
 * Pure entry point for the form: parses the HH:MM inputs and returns the
 * decision shown in the UI. No React, no state, never mutates `room`.
 */
export function evaluateRequest(
  room: Room,
  input: AvailabilityRequestInput
): AvailabilityDecision {
  const start = labelToMinutes(input.start);
  const end = labelToMinutes(input.end);
  if (start === null || end === null) {
    return unavailable('Please enter valid times in HH:MM format.');
  }

  const now = labelToMinutes(input.now);
  if (now === null) {
    return unavailable('Please enter a valid current time in HH:MM format.');
  }

  return checkAvailability(room, start, end, now);
}
