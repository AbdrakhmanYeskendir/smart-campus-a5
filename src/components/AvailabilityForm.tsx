import type { FormEvent } from 'react';
import { Field } from './Field';
import { HEADING_CLASS, PANEL_CLASS } from './styles';

interface AvailabilityFormProps {
  roomName: string | null;
  startTime: string;
  endTime: string;
  canSubmit: boolean;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function AvailabilityForm({
  roomName,
  startTime,
  endTime,
  canSubmit,
  onStartChange,
  onEndChange,
  onSubmit,
}: AvailabilityFormProps) {
  return (
    <form onSubmit={onSubmit} className={PANEL_CLASS}>
      <h2 className={`mb-4 ${HEADING_CLASS}`}>
        Check availability for <span className="text-slate-900">{roomName ?? '—'}</span>
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="start-time"
          label="Start time (HH:MM)"
          type="time"
          value={startTime}
          onChange={onStartChange}
        />
        <Field
          id="end-time"
          label="End time (HH:MM)"
          type="text"
          placeholder="HH:MM"
          value={endTime}
          onChange={onEndChange}
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        Check Availability
      </button>
    </form>
  );
}
