import { Clock } from 'lucide-react';
import { formatClock } from '../utils/format.js';

/** Countdown badge: neutral > amber at 5 minutes > red (pulsing) at 1 minute. */
export default function Timer({ seconds }) {
  const critical = seconds <= 60;
  const warning = seconds <= 300;
  const tone = critical ? 'border-red-300 bg-red-50 text-red-700' : warning ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 bg-slate-50 text-slate-800';
  return (
    <div role="timer" aria-label={`Time remaining ${formatClock(seconds)}`} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-base font-bold tabular-nums sm:px-3 sm:text-lg ${tone} ${critical ? 'animate-pulse' : ''}`}>
      <Clock size={16} aria-hidden="true" />
      {formatClock(seconds)}
    </div>
  );
}
