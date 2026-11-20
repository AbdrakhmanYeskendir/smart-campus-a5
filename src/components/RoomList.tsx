import type { ReactNode } from 'react';
import { Building2, DoorClosed, DoorOpen, Users } from 'lucide-react';
import type { Room } from '../types';
import { HEADING_CLASS } from './styles';

const BADGE_TONES = {
  rose: 'bg-rose-100 text-rose-700',
  emerald: 'bg-emerald-100 text-emerald-700',
} as const;

function Badge({ tone, children }: { tone: keyof typeof BADGE_TONES; children: ReactNode }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  );
}

function RoomCard({
  room,
  selected,
  onSelect,
}: {
  room: Room;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const count = room.bookings.length;
  return (
    <button
      onClick={() => onSelect(room.id)}
      className={`group flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
        selected
          ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-semibold text-slate-900">
          {room.blocked ? (
            <DoorClosed className="h-4 w-4 text-rose-500" />
          ) : (
            <DoorOpen className="h-4 w-4 text-emerald-600" />
          )}
          {room.name}
        </span>
        {room.blocked ? (
          <Badge tone="rose">Blocked</Badge>
        ) : (
          <Badge tone="emerald">
            {count} booking{count === 1 ? '' : 's'}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5" />
          {room.building}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {room.capacity}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {room.equipment.map((item) => (
          <span key={item} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
            {item}
          </span>
        ))}
      </div>
    </button>
  );
}

interface RoomListProps {
  rooms: Room[];
  selectedId: string;
  emptyMessage: string | null;
  onSelect: (id: string) => void;
}

/** Shows only the rooms that match the requirements, or the F4 empty state. */
export function RoomList({ rooms, selectedId, emptyMessage, onSelect }: RoomListProps) {
  return (
    <div>
      <h2 className={`mb-3 ${HEADING_CLASS}`}>Select a room</h2>
      {emptyMessage && (
        <div
          role="status"
          className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500"
        >
          {emptyMessage}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} selected={room.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
