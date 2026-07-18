import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, onBack, action }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Volver"
            className="w-11 h-11 -ml-2 flex items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold text-ink-900 tracking-tight">{title}</h1>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
