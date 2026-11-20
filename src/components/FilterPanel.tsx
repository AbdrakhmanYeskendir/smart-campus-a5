import { Field } from './Field';
import { Panel } from './Panel';

interface FilterPanelProps {
  attendees: string;
  attendeesError: string | null;
  equipmentOptions: string[];
  selectedEquipment: string[];
  matchCount: number;
  totalCount: number;
  onAttendeesChange: (value: string) => void;
  onToggleEquipment: (item: string) => void;
  onClear: () => void;
}

/** F1 (capacity) and F2 (equipment) controls. */
export function FilterPanel({
  attendees,
  attendeesError,
  equipmentOptions,
  selectedEquipment,
  matchCount,
  totalCount,
  onAttendeesChange,
  onToggleEquipment,
  onClear,
}: FilterPanelProps) {
  return (
    <Panel title="Requirements">
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <Field
          id="attendees"
          label="Attendees"
          type="number"
          min={1}
          inputMode="numeric"
          placeholder="e.g. 12"
          value={attendees}
          onChange={onAttendeesChange}
          error={attendeesError}
        />
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
                  checked={selectedEquipment.includes(item)}
                  onChange={() => onToggleEquipment(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span aria-live="polite">
          {matchCount} of {totalCount} rooms match
        </span>
        <button
          type="button"
          onClick={onClear}
          className="font-medium text-emerald-700 hover:underline"
        >
          Clear filters
        </button>
      </div>
    </Panel>
  );
}
