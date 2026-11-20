import { INPUT_CLASS, LABEL_CLASS } from './styles';

interface FieldProps {
  id: string;
  label: string;
  type: 'time' | 'text' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  inputMode?: 'numeric' | 'text';
  error?: string | null;
}

/** Label + input used for start time, end time and attendees. */
export function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  min,
  inputMode,
  error,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        min={min}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
      />
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
