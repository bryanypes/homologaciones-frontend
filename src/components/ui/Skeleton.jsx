import { cn } from '../../lib/cn';

export function SkeletonBlock({ className }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gradient-to-r from-ink-100 via-ink-50 to-ink-100 animate-shimmer',
        className,
      )}
    />
  );
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-ink-100 shadow-card px-6 py-6', className)}>
      <SkeletonBlock className="h-4 w-1/3 mb-5" />
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="rounded-2xl border border-ink-100 overflow-hidden bg-white">
      <div className="bg-ink-50 px-4 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} className="h-3 w-20" />
        ))}
      </div>
      <div className="divide-y divide-ink-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-4 flex gap-6">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonBlock key={c} className="h-3 w-20" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
