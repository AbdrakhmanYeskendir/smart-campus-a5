import { useMemo, useState } from 'react';
import {
  Clock,
  DoorClosed,
  DoorOpen,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Building2,
  CalendarClock,
} from 'lucide-react';
import { ROOMS } from './data';
import type { AvailabilityDecision, Room } from './types';
import { checkAvailability } from './lib/availability';
import { minutesToLabel, labelToMinutes } from './lib/time';
import {
  collectEquipment,
  emptyStateMessage,
  filterRooms,
  parseAttendees,
} from './lib/filter';

function App() {
  const [roomId, setRoomId] = useState<string>(ROOMS[0].id);
  const [startTime, setStartTime] = useState('10:30');
  const [endTime, setEndTime] = useState('11:30');
  const [decision, setDecision] = useState<AvailabilityDecision | null>(null);
  const [currentTime, setCurrentTime] = useState('08:30');

  const [attendees, setAttendees] = useState('');
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);

  const equipmentOptions = useMemo(() => collectEquipment(ROOMS), []);
  const attendeesInfo = parseAttendees(attendees);
  const visibleRooms = useMemo(
    () =>
      filterRooms(ROOMS, {
        minCapacity: attendeesInfo.minCapacity,
        requiredEquipment,
      }),
    [attendeesInfo.minCapacity, requiredEquipment]
  );
  const emptyMessage = emptyStateMessage(visibleRooms.length);
  const room: Room | null = visibleRooms.find((r) => r.id === roomId) ?? null;

  function updateFilters(nextAttendees: string, nextEquipment: string[]) {
    const nextVisible = filterRooms(ROOMS, {
      minCapacity: parseAttendees(nextAttendees).minCapacity,
      requiredEquipment: nextEquipment,
    });
    setAttendees(nextAttendees);
    setRequiredEquipment(nextEquipment);
    if (!nextVisible.some((r) => r.id === roomId)) {
      setRoomId(nextVisible[0]?.id ?? '');
    }
    setDecision(null);
  }

  function toggleEquipment(item: string) {
    const next = requiredEquipment.includes(item)
      ? requiredEquipment.filter((i) => i !== item)
      : [...requiredEquipment, item];
    updateFilters(attendees, next);
  }

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!room) return;
    const start = labelToMinutes(startTime);
    const end = labelToMinutes(endTime);

    if (start === null || end === null) {
      setDecision({
        status: 'unavailable',
        reason: 'Please enter valid times in HH:MM format.',
      });
      return;
    }

    const now = labelToMinutes(currentTime);

    if (now === null) {
      setDecision({
        status: 'unavailable',
        reason: 'Please enter a valid current time in HH:MM format.',
      });
      return;
    }

    setDecision(checkAvailability(room, start, end, now));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              Smart Campus Room Availability
            </h1>
            <p className="text-sm text-slate-500">
              Check whether a room is free for your desired time slot.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: room selector + form */}
          <section className="space-y-6">
            {/* Current time input */}
            <div className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
              <label
                htmlFor="current-time"
                className="flex items-center gap-2 text-sm font-medium text-slate-600"
              >
                <Clock className="h-4 w-4 text-emerald-600" />
                Supplied current time
              </label>
              <input
                id="current-time"
                type="time"
                value={currentTime}
                onChange={(e) => {
                  setCurrentTime(e.target.value);
                  setDecision(null);
                }}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 sm:ml-auto"
              />
            </div>

            {/* Requirements (F1 capacity, F2 equipment) */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Requirements
              </h2>
              <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                <div>
                  <label
                    htmlFor="attendees"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Attendees
                  </label>
                  <input
                    id="attendees"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="e.g. 12"
                    value={attendees}
                    onChange={(e) => updateFilters(e.target.value, requiredEquipment)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                  />
                  {attendeesInfo.error && (
                    <p role="alert" className="mt-1.5 text-xs text-rose-600">
                      {attendeesInfo.error}
                    </p>
                  )}
                </div>
                <fieldset>
                  <legend className="mb-1.5 block text-sm font-medium text-slate-700">
                    Required equipment (all selected)
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {equipmentOptions.map((item) => (
                      <label
                        key={item}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={requiredEquipment.includes(item)}
                          onChange={() => toggleEquipment(item)}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span aria-live="polite">
                  {visibleRooms.length} of {ROOMS.length} rooms match
                </span>
                <button
                  type="button"
                  onClick={() => updateFilters('', [])}
                  className="font-medium text-emerald-700 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            </div>

            {/* Room cards */}
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Select a room
              </h2>
              {emptyMessage && (
                <div
                  role="status"
                  className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {visibleRooms.map((r) => {
                  const selected = r.id === roomId;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setRoomId(r.id);
                        setDecision(null);
                      }}
                      className={`group flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
                        selected
                          ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-semibold text-slate-900">
                          {r.blocked ? (
                            <DoorClosed className="h-4 w-4 text-rose-500" />
                          ) : (
                            <DoorOpen className="h-4 w-4 text-emerald-600" />
                          )}
                          {r.name}
                        </span>
                        {r.blocked ? (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                            Blocked
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {r.bookings.length} booking
                            {r.bookings.length === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {r.building}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {r.capacity}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {r.equipment.map((item) => (
                          <span
                            key={item}
                            className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability form */}
            <form
              onSubmit={handleCheck}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Check availability for{' '}
                <span className="text-slate-900">{room ? room.name : '—'}</span>
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="start-time"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Start time (HH:MM)
                  </label>
                  <input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setDecision(null);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="end-time"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    End time (HH:MM)
                  </label>
                  <input
                    id="end-time"
                    type="text"
                    placeholder="HH:MM"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      setDecision(null);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!room}
                className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Check Availability
              </button>
            </form>
          </section>

          {/* Right: result + schedule */}
          <aside className="space-y-6">
            {/* Decision panel */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Result
              </h2>

              {!decision && (
                <p className="py-6 text-center text-sm text-slate-400">
                  Select a room and time, then check availability.
                </p>
              )}

              {decision?.status === 'available' && (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                  <p className="text-lg font-bold text-emerald-700">
                    Available
                  </p>
                  <p className="text-sm text-slate-500">
                    {room?.name} is free from{' '}
                    <strong>{startTime}</strong> to{' '}
                    <strong>{endTime}</strong>.
                  </p>
                </div>
              )}

              {decision?.status === 'unavailable' && (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <XCircle className="h-12 w-12 text-rose-500" />
                  <p className="text-lg font-bold text-rose-600">
                    Unavailable
                  </p>
                  <div className="flex items-start gap-1.5 text-sm text-slate-600">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <span>{decision.reason}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Existing schedule for selected room */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {room ? room.name : 'No room'} — existing bookings
              </h2>

              {!room ? (
                <p className="text-sm text-slate-400">
                  Select a room to see its bookings.
                </p>
              ) : room.blocked ? (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-3 text-sm text-rose-700">
                  <DoorClosed className="h-4 w-4" />
                  {room.blockReason}
                </div>
              ) : room.bookings.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No existing bookings today.
                </p>
              ) : (
                <ul className="space-y-2">
                  {room.bookings.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm"
                    >
                      <span className="font-medium text-slate-700">
                        {b.title}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {minutesToLabel(b.start)}–{minutesToLabel(b.end)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 text-center text-xs text-slate-400 sm:px-6">
          Smart Campus · Room Availability Checker · Sample data only
        </div>
      </footer>
    </div>
  );
}

export default App;
