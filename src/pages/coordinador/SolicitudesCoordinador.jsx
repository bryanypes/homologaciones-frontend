import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import EstadoBadge from '../../components/EstadoBadge';
import { useFeedback } from '../../context/FeedbackContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ClickableRow from '../../components/ui/ClickableRow';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Select, Input } from '../../components/ui/Field';

const ESTADOS = ['', 'borrador', 'enviada', 'en_revision', 'procesando_ia', 'pendiente_rector', 'aprobada', 'rechazada'];

export default function SolicitudesCoordinador() {
  const navigate = useNavigate();
  const { showError } = useFeedback();
  const [solicitudes, setSolicitudes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [cargando, setCargando] = useState(true);
  const POR_PAGINA = 10;

  const cargar = async (pag = 1) => {
    setCargando(true);
    try {
      const params = { page: pag, size: POR_PAGINA };
      if (filtroEstado) params.estado = filtroEstado;
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      const { data } = await client.get('/solicitudes/', { params });
      setSolicitudes(data.items ?? data);
      setTotal(data.total ?? (data.items ?? data).length);
      setPagina(pag);
    } catch {
      showError('No se pudieron cargar las solicitudes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(1); }, [filtroEstado, fechaDesde, fechaHasta]);

  const resumenPorEstado = useMemo(() => {
    const conteo = {};
    solicitudes.forEach((s) => { conteo[s.estado] = (conteo[s.estado] ?? 0) + 1; });
    return Object.entries(conteo);
  }, [solicitudes]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader title="Solicitudes" />

        {!cargando && solicitudes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-xs text-ink-500">En esta página:</span>
            {resumenPorEstado.map(([estado, count]) => (
              <span key={estado} className="inline-flex items-center gap-1">
                <EstadoBadge estado={estado} />
                <span className="text-xs text-ink-500">×{count}</span>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-3 mb-6">
          <Select label="Estado" className="min-w-[180px]" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS.filter(Boolean).map((e) => (
              <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>
            ))}
          </Select>
          <Input label="Desde" type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
          <Input label="Hasta" type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          {(filtroEstado || fechaDesde || fechaHasta) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFiltroEstado(''); setFechaDesde(''); setFechaHasta(''); }}
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {cargando ? (
          <SkeletonTable rows={5} cols={5} />
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-card">
              <table className="min-w-full divide-y divide-ink-100 text-sm">
                <thead className="bg-ink-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Estudiante</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Programa origen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Programa destino</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {solicitudes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-0">
                        <EmptyState title="No hay solicitudes." />
                      </td>
                    </tr>
                  ) : solicitudes.map((s) => (
                    <ClickableRow key={s.id} onClick={() => navigate(`/coordinador/solicitudes/${s.id}`)}>
                      <td className="px-4 py-3.5 text-ink-700">{[s.nombre_estudiante, s.apellido_estudiante].filter(Boolean).join(' ') || '—'}</td>
                      <td className="px-4 py-3.5 text-ink-700">{s.programa_origen ?? '—'}</td>
                      <td className="px-4 py-3.5 text-ink-700">{s.programa_destino ?? '—'}</td>
                      <td className="px-4 py-3.5"><EstadoBadge estado={s.estado} /></td>
                      <td className="px-4 py-3.5 text-ink-500">
                        {s.creado_en ? new Date(s.creado_en).toLocaleDateString('es-CO') : '—'}
                      </td>
                    </ClickableRow>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination pagina={pagina} total={total} porPagina={POR_PAGINA} onPageChange={cargar} />
          </>
        )}
      </main>
    </div>
  );
}
