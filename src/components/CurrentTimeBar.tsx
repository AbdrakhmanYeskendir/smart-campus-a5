import { Clock } from 'lucide-react';
import { COMPACT_INPUT_CLASS } from './styles';

interface CurrentTimeBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function CurrentTimeBar({ value, onChange }: CurrentTimeBarProps) {
  return (
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={COMPACT_INPUT_CLASS}
      />
    </div>
  );
}
