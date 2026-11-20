import { useReducer } from 'react';
import type { FormEvent } from 'react';
import { CalendarClock } from 'lucide-react';
import { ROOMS, SUPPLIED_CURRENT_TIME } from './data';
import { collectEquipment, emptyStateMessage, parseAttendees } from './lib/filter';
import { createInitialState, createReducer, selectedRoom, visibleRooms } from './lib/state';
import { minutesToLabel } from './lib/time';
import { AvailabilityForm } from './components/AvailabilityForm';
import { BookingsPanel } from './components/BookingsPanel';
import { CurrentTimeBar } from './components/CurrentTimeBar';
import { FilterPanel } from './components/FilterPanel';
import { ResultPanel } from './components/ResultPanel';
import { RoomList } from './components/RoomList';

const reducer = createReducer(ROOMS);
const INITIAL_STATE = createInitialState(ROOMS, minutesToLabel(SUPPLIED_CURRENT_TIME));
const EQUIPMENT_OPTIONS = collectEquipment(ROOMS);

function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const rooms = visibleRooms(ROOMS, state);
  const room = selectedRoom(ROOMS, state);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    dispatch({ type: 'check' });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
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
          <section className="space-y-6">
            <CurrentTimeBar
              value={state.currentTime}
              onChange={(value) => dispatch({ type: 'setCurrentTime', value })}
            />
            <FilterPanel
              attendees={state.attendees}
              attendeesError={parseAttendees(state.attendees).error}
              equipmentOptions={EQUIPMENT_OPTIONS}
              selectedEquipment={state.requiredEquipment}
              matchCount={rooms.length}
              totalCount={ROOMS.length}
              onAttendeesChange={(value) => dispatch({ type: 'setAttendees', value })}
              onToggleEquipment={(item) => dispatch({ type: 'toggleEquipment', item })}
              onClear={() => dispatch({ type: 'clearFilters' })}
            />
            <RoomList
              rooms={rooms}
              selectedId={state.roomId}
              emptyMessage={emptyStateMessage(rooms.length)}
              onSelect={(roomId) => dispatch({ type: 'selectRoom', roomId })}
            />
            <AvailabilityForm
              roomName={room?.name ?? null}
              startTime={state.startTime}
              endTime={state.endTime}
              canSubmit={room !== null}
              onStartChange={(value) => dispatch({ type: 'setStartTime', value })}
              onEndChange={(value) => dispatch({ type: 'setEndTime', value })}
              onSubmit={handleSubmit}
            />
          </section>

          <aside className="space-y-6">
            <ResultPanel
              decision={state.decision}
              roomName={room?.name ?? null}
              startTime={state.startTime}
              endTime={state.endTime}
            />
            <BookingsPanel room={room} />
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
