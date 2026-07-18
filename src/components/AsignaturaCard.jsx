import { useState } from 'react';
import { ArrowRight, ArrowDown, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../lib/cn';
import EstadoBadge from './EstadoBadge';
import SimilitudBar from './SimilitudBar';

const ESTADOS_ASIGNATURA = [
  { value: 'homologada', label: 'Homologada' },
  { value: 'homologada_parcial', label: 'Homologada parcial' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'no_homologada', label: 'No homologada' },
];

const ACCENTO_ESTADO = {
  homologada: 'border-l-success-600',
  homologada_parcial: 'border-l-accent-500',
  pendiente: 'border-l-accent-400',
  no_homologada: 'border-l-danger-600',
};

export default function AsignaturaCard({ asignatura: a, editable = false, edicion, onChangeEstado, onChangeJustificacion, onEliminar }) {
  const [expandido, setExpandido] = useState(false);
  const estadoActual = edicion?.estado ?? a.estado;
  const justificacionActual = edicion?.justificacion ?? a.justificacion ?? '';
  const justificacionLarga = !editable && a.justificacion && a.justificacion.length > 60;

  return (
    <div
      className={cn(
        'rounded-2xl border border-l-4 border-ink-100 bg-white shadow-card px-5 py-5 transition-shadow hover:shadow-float',
        ACCENTO_ESTADO[estadoActual] ?? 'border-l-ink-200',
      )}
    >
      {a.fue_corregida && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-accent-700 bg-accent-50 border border-accent-100 rounded-full px-2.5 py-1 w-fit mb-3">
          <Pencil className="w-3 h-3" aria-hidden="true" />
          Corregido por el coordinador
          {a.estado_ia_original && <span className="text-accent-600/80">· la IA sugirió {a.estado_ia_original}</span>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-1">Origen</p>
          <p className="font-semibold text-ink-900 truncate">{a.asignatura_origen}</p>
          <p className="text-xs text-ink-500 mt-0.5">
            {a.creditos_origen != null ? `${a.creditos_origen} créd.` : null}
            {a.creditos_origen != null && a.calificacion_origen != null ? ' · ' : null}
            {a.calificacion_origen != null ? `Nota ${a.calificacion_origen}` : null}
          </p>
        </div>

        <ArrowRight className="hidden sm:block w-5 h-5 text-ink-300 shrink-0" aria-hidden="true" />
        <ArrowDown className="sm:hidden w-5 h-5 text-ink-300 shrink-0" aria-hidden="true" />

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-1">Destino</p>
          {a.asignatura_destino ? (
            <>
              <p className="font-semibold text-ink-900 truncate">{a.asignatura_destino}</p>
              <p className="text-xs text-ink-500 mt-0.5">
                {a.semestre_destino != null ? `Semestre ${a.semestre_destino}` : null}
                {a.semestre_destino != null && a.creditos_destino != null ? ' · ' : null}
                {a.creditos_destino != null ? `${a.creditos_destino} créd.` : null}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-400">Sin equivalente</p>
          )}
        </div>

        {editable && onEliminar && (
          <button
            type="button"
            onClick={onEliminar}
            aria-label={`Eliminar asignatura ${a.asignatura_origen}`}
            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-lg text-danger-600 hover:bg-danger-50 transition-colors self-start sm:self-center"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 pt-4 border-t border-ink-100">
        <SimilitudBar valor={a.similitud_porcentaje} label={`Similitud para ${a.asignatura_origen}`} />

        {editable ? (
          <label className="flex items-center gap-2 text-xs">
            <span className="sr-only">Estado de {a.asignatura_origen}</span>
            <select
              value={estadoActual}
              onChange={(e) => onChangeEstado(e.target.value)}
              className="border border-ink-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 bg-white"
            >
              {ESTADOS_ASIGNATURA.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        ) : (
          <EstadoBadge estado={a.estado} />
        )}

        {editable ? (
          <label className="flex-1 min-w-[200px] flex items-center gap-2 text-xs">
            <span className="sr-only">Justificación para {a.asignatura_origen}</span>
            <input
              type="text"
              value={justificacionActual}
              onChange={(e) => onChangeJustificacion(e.target.value)}
              placeholder="Escribe una justificación..."
              className="w-full border border-ink-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </label>
        ) : (
          a.justificacion && (
            <div className="flex-1 min-w-[200px] flex items-start justify-between gap-2">
              <p className={cn('text-xs text-ink-500', !expandido && 'truncate')}>{a.justificacion}</p>
              {justificacionLarga && (
                <button
                  type="button"
                  onClick={() => setExpandido((v) => !v)}
                  aria-expanded={expandido}
                  aria-label={expandido ? 'Ver menos justificación' : 'Ver más justificación'}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                >
                  <ChevronDown className={cn('w-4 h-4 transition-transform', expandido && 'rotate-180')} aria-hidden="true" />
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
