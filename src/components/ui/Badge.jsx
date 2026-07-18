import { cn } from '../../lib/cn';

const TONES = {
  neutral: 'bg-ink-100 text-ink-600',
  brand: 'bg-primary-100 text-primary-700',
  brandStrong: 'bg-primary-600 text-white',
  accent: 'bg-accent-200 text-accent-900',
  accentStrong: 'bg-accent-600 text-ink-900',
  info: 'bg-primary-50 text-primary-700 border border-primary-100',
  success: 'bg-success-100 text-success-700',
  danger: 'bg-danger-100 text-danger-700',
};

export default function Badge({ tone = 'neutral', icon: Icon, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />}
      {children}
    </span>
  );
}
