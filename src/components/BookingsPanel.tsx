import { DoorClosed } from 'lucide-react';
import type { Room } from '../types';
import { minutesToLabel } from '../lib/time';
import { Panel } from './Panel';

export function BookingsPanel({ room }: { room: Room | null }) {
  return (
    <Panel title={`${room ? room.name : 'No room'} — existing bookings`}>
      {!room ? (
        <p className="text-sm text-slate-400">Select a room to see its bookings.</p>
      ) : room.blocked ? (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-3 text-sm text-rose-700">
          <DoorClosed className="h-4 w-4" />
          {room.blockReason}
        </div>
      ) : room.bookings.length === 0 ? (
        <p className="text-sm text-slate-400">No existing bookings today.</p>
      ) : (
        <ul className="space-y-2">
          {room.bookings.map((b, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm"
            >
              <span className="font-medium text-slate-700">{b.title}</span>
              <span className="font-mono text-xs text-slate-500">
                {minutesToLabel(b.start)}–{minutesToLabel(b.end)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
