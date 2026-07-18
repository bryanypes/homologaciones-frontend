export default function SimilitudBar({ valor, label = 'Similitud' }) {
  if (valor == null) return <span className="text-ink-400">—</span>;
  const clamped = Math.min(100, Math.max(0, valor));
  return (
    <div className="flex items-center gap-2 min-w-[84px]">
      <div
        className="flex-1 h-1.5 rounded-full bg-ink-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clamped}%`}
      >
        <div className="h-full bg-primary-600 rounded-full" style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs text-ink-600 font-medium tabular-nums w-9 text-right" aria-hidden="true">{valor}%</span>
    </div>
  );
}
