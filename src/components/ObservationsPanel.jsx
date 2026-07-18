export default function ObservationsPanel({ titulo = 'Observaciones de IA', texto, mascot = '/img/IAseñalandoderecha.svg', className }) {
  if (!texto) return null;
  return (
    <div className={`rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-4 flex items-start gap-3 ${className ?? ''}`}>
      <div className="w-11 h-11 rounded-full bg-white border border-primary-100 flex items-center justify-center shrink-0 overflow-hidden p-1.5">
        <img src={mascot} alt="" className="w-full h-full object-contain" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-900 mb-1">{titulo}</p>
        <p className="text-sm text-ink-600 leading-relaxed">{texto}</p>
      </div>
    </div>
  );
}
