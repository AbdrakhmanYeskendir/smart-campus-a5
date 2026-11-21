import type { AvailabilityDecision, Room } from '../types';
import { evaluateRequest } from './availabilityRequest';
import { filterRooms, parseAttendees } from './filter';
import type { RoomCriteria } from './filter';

/** Everything the screen needs to remember. Plain data, no React. */
export interface AppState {
  /** Selected room id; '' means "no room selected" (nothing matches the filters). */
  roomId: string;
  attendees: string;
  requiredEquipment: string[];
  startTime: string;
  endTime: string;
  currentTime: string;
  decision: AvailabilityDecision | null;
}

export type Action =
  | { type: 'selectRoom'; roomId: string }
  | { type: 'setAttendees'; value: string }
  | { type: 'toggleEquipment'; item: string }
  | { type: 'clearFilters' }
  | { type: 'setStartTime'; value: string }
  | { type: 'setEndTime'; value: string }
  | { type: 'setCurrentTime'; value: string }
  | { type: 'check' };

export function criteriaOf(state: AppState): RoomCriteria {
  return {
    minCapacity: parseAttendees(state.attendees).minCapacity,
    requiredEquipment: state.requiredEquipment,
  };
}

/** F1 + F2: the rooms the user is allowed to pick from. */
export function visibleRooms(rooms: readonly Room[], state: AppState): Room[] {
  return filterRooms(rooms, criteriaOf(state));
}

/** The selected room, or null when it is hidden by the filters / nothing is selected. */
export function selectedRoom(rooms: readonly Room[], state: AppState): Room | null {
  return visibleRooms(rooms, state).find((room) => room.id === state.roomId) ?? null;
}

/**
 * R1 mitigation: a check may run only when a room is selected AND the attendees
 * text is valid (blank = no requirement). Invalid text still hides no rooms (S12),
 * but it can no longer produce a decision for a room that was never size-filtered.
 */
export function canCheck(rooms: readonly Room[], state: AppState): boolean {
  return selectedRoom(rooms, state) !== null && parseAttendees(state.attendees).error === null;
}

export function createInitialState(rooms: readonly Room[], currentTime: string): AppState {
  return {
    roomId: rooms[0]?.id ?? '',
    attendees: '',
    requiredEquipment: [],
    startTime: '10:30',
    endTime: '11:30',
    currentTime,
    decision: null,
  };
}

/**
 * Builds the reducer for a given catalog. Pure: never mutates the previous state
 * or the rooms.
 *
 * F5 rule, written once: every input change (room, filters, times) clears the
 * previous decision; only the explicit 'check' action produces a new one.
 */
export function createReducer(rooms: readonly Room[]) {
  // After a filter change keep the selection if it is still visible, otherwise
  // move to the first visible room (or to "none").
  function withFilters(next: AppState): AppState {
    const visible = visibleRooms(rooms, next);
    const keep = visible.some((room) => room.id === next.roomId);
    return { ...next, roomId: keep ? next.roomId : (visible[0]?.id ?? '') };
  }

  // The input part of every action, without touching the decision.
  function applyInput(state: AppState, action: Exclude<Action, { type: 'check' }>): AppState {
    switch (action.type) {
      case 'selectRoom': {
        const allowed = visibleRooms(rooms, state).some((room) => room.id === action.roomId);
        return allowed ? { ...state, roomId: action.roomId } : state;
      }
      case 'setAttendees':
        return withFilters({ ...state, attendees: action.value });
      case 'toggleEquipment': {
        const requiredEquipment = state.requiredEquipment.includes(action.item)
          ? state.requiredEquipment.filter((item) => item !== action.item)
          : [...state.requiredEquipment, action.item];
        return withFilters({ ...state, requiredEquipment });
      }
      case 'clearFilters':
        return withFilters({ ...state, attendees: '', requiredEquipment: [] });
      case 'setStartTime':
        return { ...state, startTime: action.value };
      case 'setEndTime':
        return { ...state, endTime: action.value };
      case 'setCurrentTime':
        return { ...state, currentTime: action.value };
    }
  }

  return function reducer(state: AppState, action: Action): AppState {
    if (action.type === 'check') {
      const room = selectedRoom(rooms, state);
      if (!room || !canCheck(rooms, state)) return state;
      return {
        ...state,
        decision: evaluateRequest(room, {
          start: state.startTime,
          end: state.endTime,
          now: state.currentTime,
        }),
      };
    }
    const next = applyInput(state, action);
    return next === state ? state : { ...next, decision: null };
  };
}
