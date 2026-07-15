export default function TablaPaginada({ columnas, datos, total, pagina, porPagina = 10, onPageChange }) {
  const totalPaginas = Math.ceil(total / porPagina);

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columnas.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {datos.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} className="px-4 py-8 text-center text-gray-400">
                  No hay registros.
                </td>
              </tr>
            ) : (
              datos.map((fila, i) => (
                <tr key={i} className="hover:bg-gray-50 cursor-pointer" onClick={() => fila._onClick?.()}>
                  {columnas.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render ? col.render(fila) : fila[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>Página {pagina} de {totalPaginas} — {total} registros</span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagina - 1)}
              disabled={pagina <= 1}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(pagina + 1)}
              disabled={pagina >= totalPaginas}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}