import EstadoBadge from './EstadoBadge';
import { formatFechaHora } from '../lib/format';

export default function Timeline({ eventos }) {
  if (!eventos?.length) return null;

  return (
    <ol className="relative border-l border-ink-200 ml-3">
      {eventos.map((h, i) => (
        <li key={i} className="mb-6 ml-5 last:mb-0">
          <span className="absolute -left-[9px] w-4 h-4 rounded-full bg-white border-2 border-primary-500 shrink-0" aria-hidden="true" />
          <p className="text-xs text-ink-400 mb-1.5">
            {formatFechaHora(h.creado_en)}
            {h.usuario_nombre && <span className="ml-2 text-ink-500">· {h.usuario_nombre}</span>}
          </p>
          <p className="text-sm text-ink-700 flex items-center gap-2 flex-wrap">
            <EstadoBadge estado={h.estado_anterior} />
            <span className="text-ink-400" aria-hidden="true">→</span>
            <EstadoBadge estado={h.estado_nuevo} />
          </p>
          {h.observacion && (
            <p className="text-xs text-ink-500 mt-1.5 pl-2.5 border-l-2 border-ink-200">{h.observacion}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
