import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../lib/cn';

const TONES = {
  success: 'bg-success-50 border-success-200 text-success-700',
  danger: 'bg-danger-50 border-danger-200 text-danger-700',
  warning: 'bg-accent-50 border-accent-300 text-accent-900',
  info: 'bg-primary-50 border-primary-100 text-primary-700',
};

const ICONS = {
  success: CheckCircle2,
  danger: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

export default function Alert({ tone = 'info', children, className }) {
  if (!children) return null;
  const Icon = ICONS[tone] ?? ICONS.info;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
      className={cn(
        'flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm',
        TONES[tone] ?? TONES.info,
        className,
      )}
    >
      <Icon className="w-4.5 h-4.5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
