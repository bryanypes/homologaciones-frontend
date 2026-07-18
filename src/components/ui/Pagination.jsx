import Button from './Button';

export default function Pagination({ pagina, total, porPagina = 10, onPageChange }) {
  const totalPaginas = Math.ceil(total / porPagina);
  if (totalPaginas <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-ink-600 flex-wrap gap-3">
      <span>Página {pagina} de {totalPaginas} — {total} registros</span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(pagina - 1)} disabled={pagina <= 1}>
          Anterior
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(pagina + 1)} disabled={pagina >= totalPaginas}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
