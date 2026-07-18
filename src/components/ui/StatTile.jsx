import { cn } from '../../lib/cn';

const TONES = {
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-success-700',
  accent: 'bg-accent-100 text-accent-900',
  danger: 'bg-danger-50 text-danger-700',
};

export default function StatTile({ icon: Icon, value, label, tone = 'primary', className }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3.5 shadow-card', className)}>
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', TONES[tone] ?? TONES.primary)}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-ink-900 leading-tight tabular-nums">{value}</p>
        <p className="text-xs text-ink-500 truncate">{label}</p>
      </div>
    </div>
  );
}
