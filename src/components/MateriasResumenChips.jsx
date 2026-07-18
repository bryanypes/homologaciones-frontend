export default function MateriasResumenChips({ homologadas = [], pendientes = [] }) {
  if (!homologadas.length && !pendientes.length) return null;

  return (
    <div className="flex flex-col gap-3 mb-4">
      {homologadas.length > 0 && (
        <div>
          <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">
            Materias homologadas ({homologadas.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {homologadas.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 text-xs font-medium text-success-700 bg-success-50 border border-success-100 px-2.5 py-1 rounded-full"
              >
                {a.asignatura_destino || a.asignatura_origen}
              </span>
            ))}
          </div>
        </div>
      )}
      {pendientes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">
            Materias por revisar ({pendientes.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {pendientes.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 text-xs font-medium text-accent-800 bg-accent-50 border border-accent-100 px-2.5 py-1 rounded-full"
              >
                {a.asignatura_destino || a.asignatura_origen}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
