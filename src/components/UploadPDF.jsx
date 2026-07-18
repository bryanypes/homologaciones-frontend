import { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Trash2, RefreshCw, Download, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/cn';
import { formatBytes, formatFecha } from '../lib/format';

export default function UploadPDF({
  label = 'Seleccionar PDF',
  hint,
  accept = 'application/pdf',
  onFile,
  file = null,
  existing = null,
  status: statusProp,
  progress = 0,
  onRemove,
  onDownload,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState(null);

  const status = statusProp ?? (existing ? 'success' : file ? 'selected' : 'idle');

  const procesarArchivo = (candidate) => {
    if (!candidate) return;
    const aceptaPdf = accept.includes('pdf');
    const tiposValidos = accept.split(',').map((t) => t.trim());
    const valido = tiposValidos.includes(candidate.type) || (aceptaPdf && candidate.type === 'application/pdf');
    if (!valido) {
      setError(`Formato no permitido. Se espera: ${accept}.`);
      return;
    }
    setError(null);
    onFile(candidate);
  };

  const handleChange = (e) => procesarArchivo(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    if (disabled) return;
    procesarArchivo(e.dataTransfer.files?.[0]);
  };

  const abrirSelector = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      abrirSelector();
    }
  };

  const nombreArchivo = existing?.nombre_original ?? file?.name;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink-700">{label}</p>
        {status === 'success' && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success-700">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            Subido
          </span>
        )}
      </div>

      {status === 'idle' && (
        <div
          onClick={abrirSelector}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setArrastrando(true); }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex flex-col items-center justify-center gap-2 text-center cursor-pointer',
            'rounded-xl border-2 border-dashed px-6 py-8 transition-colors',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            arrastrando ? 'border-primary-500 bg-primary-50' : 'border-ink-200 bg-ink-50/60 hover:border-primary-300 hover:bg-primary-50/50',
          )}
        >
          <span className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
            <UploadCloud className="w-4.5 h-4.5" aria-hidden="true" />
          </span>
          <p className="text-xs text-ink-500">Arrastra tu archivo aquí o haz clic para buscarlo</p>
        </div>
      )}

      {(status === 'selected' || status === 'success' || status === 'uploading') && nombreArchivo && (
        <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50 px-3.5 py-3">
          <span className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
            status === 'success' ? 'bg-success-100 text-success-700' : 'bg-primary-100 text-primary-700',
          )}>
            {status === 'uploading' ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" aria-hidden="true" />
            ) : status === 'success' ? (
              <CheckCircle2 className="w-4.5 h-4.5" aria-hidden="true" />
            ) : (
              <FileText className="w-4.5 h-4.5" aria-hidden="true" />
            )}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink-800 font-medium truncate">{nombreArchivo}</p>
            {file && status !== 'uploading' && (
              <p className="text-xs text-ink-500">{formatBytes(file.size)} · pendiente de subir</p>
            )}
            {status === 'success' && existing && (existing.tamano_bytes != null || existing.creado_en) && (
              <p className="text-xs text-ink-500">
                {[
                  existing.tamano_bytes != null ? formatBytes(existing.tamano_bytes) : null,
                  existing.creado_en ? formatFecha(existing.creado_en) : null,
                ].filter(Boolean).join(' · ')}
              </p>
            )}
            {status === 'uploading' && (
              <div className="mt-1.5 h-1.5 rounded-full bg-ink-200 overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(4, progress))}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Subiendo ${nombreArchivo}`}
                />
              </div>
            )}
          </div>
          {status !== 'uploading' && (
            <div className="flex items-center gap-1 shrink-0">
              {status === 'success' && onDownload && (
                <button
                  type="button"
                  onClick={onDownload}
                  aria-label="Descargar documento"
                  className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-500 hover:bg-white hover:text-primary-700 transition-colors"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={abrirSelector}
                  aria-label="Reemplazar documento"
                  className="w-11 h-11 flex items-center justify-center rounded-lg text-ink-500 hover:bg-white hover:text-primary-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
              {!disabled && onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label="Quitar documento"
                  className="w-11 h-11 flex items-center justify-center rounded-lg text-danger-600 hover:bg-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {hint && !error && <p className="text-xs text-ink-500">{hint}</p>}
      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-danger-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
