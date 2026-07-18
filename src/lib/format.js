export function formatBytes(bytes) {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-CO');
}

export function formatFechaHora(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return `${d.toLocaleDateString('es-CO')} · ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
}
