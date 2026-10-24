import { Info } from 'lucide-react';

export default function DemoBadge({ message = 'This section contains demonstration data.' }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 bg-accent/10 border border-accent/30 rounded-md text-xs text-amber-800">
      <Info size={14} className="text-accent mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
