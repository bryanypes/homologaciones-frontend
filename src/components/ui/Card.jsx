import { cn } from '../../lib/cn';

export default function Card({ className, padded = true, children, ...rest }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-ink-100 shadow-card',
        padded && 'px-6 py-6 sm:px-7 sm:py-7',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, action, subtitle, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-5', className)}>
      <div>
        <h2 className="font-semibold text-ink-900 text-base">{title}</h2>
        {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
