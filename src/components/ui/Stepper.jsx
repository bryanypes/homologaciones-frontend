import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Stepper({ steps, current }) {
  return (
    <div className="mb-8">
      {/* Desktop / tablet */}
      <ol className="hidden sm:flex items-start">
        {steps.map((label, i) => {
          const isDone = i < current;
          const isCurrent = i === current;
          return (
            <li key={label} className={cn('flex items-center', i !== steps.length - 1 && 'flex-1')}>
              <div className="flex flex-col items-center gap-1.5 w-20 shrink-0">
                <span
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors',
                    isDone ? 'bg-primary-600 text-white' : isCurrent ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600' : 'bg-ink-100 text-ink-400',
                  )}
                >
                  {isDone ? <Check className="w-4 h-4" aria-hidden="true" /> : i + 1}
                </span>
                <span className={cn('text-xs font-medium text-center leading-tight', isCurrent ? 'text-ink-900' : 'text-ink-400')}>
                  {label}
                </span>
              </div>
              {i !== steps.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-1 mt-4', isDone ? 'bg-primary-600' : 'bg-ink-100')} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile */}
      <div className="sm:hidden">
        <p className="text-sm font-medium text-ink-700 mb-2">
          Paso {current + 1} de {steps.length} — <span className="text-primary-700">{steps[current]}</span>
        </p>
        <div
          className="h-1.5 rounded-full bg-ink-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={current + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label={`Paso ${current + 1} de ${steps.length}`}
        >
          <div
            className="h-full bg-primary-600 rounded-full transition-all"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
