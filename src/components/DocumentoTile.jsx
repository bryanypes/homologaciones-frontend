import { FileText, Eye, Download, CheckCircle2 } from 'lucide-react';
import { formatBytes, formatFecha } from '../lib/format';

export default function DocumentoTile({ nombre, tipoLabel, tamanoBytes, fecha, onVer, onDescargar }) {
  const meta = [tamanoBytes != null ? formatBytes(tamanoBytes) : null, fecha ? formatFecha(fecha) : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 px-3.5 py-3">
      <div className="w-10 h-10 rounded-lg bg-white border border-ink-100 flex items-center justify-center text-primary-600 shrink-0">
        <FileText className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-800 truncate">{nombre}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
          {tipoLabel && (
            <span className="text-xs text-ink-500 bg-white border border-ink-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              {tipoLabel}
            </span>
          )}
          {meta && <span className="text-xs text-ink-400 whitespace-nowrap">{meta}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-success-600 mr-0.5" aria-label="Subido">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
        </span>
        {onVer && (
          <button
            onClick={onVer}
            aria-label={`Ver ${nombre}`}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-primary-700 hover:bg-white transition-colors"
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
        {onDescargar && (
          <button
            onClick={onDescargar}
            aria-label={`Descargar ${nombre}`}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-500 hover:bg-white transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
