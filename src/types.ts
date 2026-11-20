export interface Booking {
  start: number; // minutes after midnight
  end: number;
  title: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  blockReason?: string;
  bookings: Booking[];
}

export type AvailabilityDecision =
  | { status: 'available' }
  | { status: 'unavailable'; reason: string };

export type ValidationResult =
  | { valid: true }
  | { valid: false; reason: string };
