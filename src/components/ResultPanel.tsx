import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import type { AvailabilityDecision } from '../types';
import { Panel } from './Panel';

const OUTCOME_CLASS = 'flex flex-col items-center gap-2 py-4 text-center';

interface ResultPanelProps {
  decision: AvailabilityDecision | null;
  roomName: string | null;
  startTime: string;
  endTime: string;
}

export function ResultPanel({ decision, roomName, startTime, endTime }: ResultPanelProps) {
  return (
    <Panel title="Result">
      {!decision && (
        <p className="py-6 text-center text-sm text-slate-400">
          Select a room and time, then check availability.
        </p>
      )}

      {decision?.status === 'available' && (
        <div className={OUTCOME_CLASS}>
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          <p className="text-lg font-bold text-emerald-700">Available</p>
          <p className="text-sm text-slate-500">
            {roomName} is free from <strong>{startTime}</strong> to <strong>{endTime}</strong>.
          </p>
        </div>
      )}

      {decision?.status === 'unavailable' && (
        <div className={OUTCOME_CLASS}>
          <XCircle className="h-12 w-12 text-rose-500" />
          <p className="text-lg font-bold text-rose-600">Unavailable</p>
          <div className="flex items-start gap-1.5 text-sm text-slate-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <span>{decision.reason}</span>
          </div>
        </div>
      )}
    </Panel>
  );
}
